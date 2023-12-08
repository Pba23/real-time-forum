package models

import (
	"log"
	"net/http"
	"sync"
	"time"
	"fmt"
	"github.com/gofrs/uuid"
)

// SessionExpiry represents the duration until a session expires.
const SessionExpiry = 2 * time.Hour

// AllSessions is a concurrent map to store active sessions.
var AllSessions sync.Map

// Session represents a user session.
type Session struct {
	UserID   string    `json:"user_id"`
	Nickname string    `json:"username"`
	ExpireAt time.Time `json:"exp"`
}

// isExpired checks if the session has expired.
func (s Session) isExpired() bool {
	return s.ExpireAt.Before(time.Now())
}

// ValidSession checks if a valid session exists in the request.
func ValidSession(req *http.Request) bool {
	cookie, err := req.Cookie("auth_session")
	fmt.Println("\n\n-----------------------\n", cookie.Value)
	return err == nil && isValidSession(cookie.Value)
}

// GetUserFromSession retrieves the user associated with the session.
func GetUserFromSession(req *http.Request) *User {
	user := User{}
	cookie, err := req.Cookie("auth_session")
	if err == nil {
		if session, ok := AllSessions.Load(cookie.Value); ok {
			_user, err := UserRepo.GetUserByID(session.(Session).UserID)
			if err == nil {
				user = *_user
			} else {
				log.Println("❌ Failed to retrieve user:", err)
			}
		}
	}
	return &user
}

// NewSessionToken creates a new session token and sets it as a cookie.
func NewSessionToken(res http.ResponseWriter, UserID, Nickname string) {
	sessionToken := generateSessionToken()

	deleteSessionIfExist(Nickname)

	ExpireAt := time.Now().Add(SessionExpiry)
	AllSessions.Store(sessionToken, Session{UserID, Nickname, ExpireAt})

	http.SetCookie(res, &http.Cookie{
		Name:     "auth_session",
		Value:    sessionToken,
		HttpOnly: true,
		Expires:  ExpireAt,
		Secure:   true, // Set to true if served over HTTPS
	})
}

// deleteSessionIfExist deletes existing sessions for a given username.
func deleteSessionIfExist(username string) {
	AllSessions.Range(func(key, value interface{}) bool {
		if value.(Session).Nickname == username {
			AllSessions.Delete(key)
		}
		return true
	})
}

// isValidSession checks if a session is valid.
func isValidSession(sessionToken string) bool {
	if session, ok := AllSessions.Load(sessionToken); ok {
		return !session.(Session).isExpired()
	}
	return false
}

// generateSessionToken generates a new session token.
func generateSessionToken() string {
	sessionToken, err := uuid.NewV4()
	if err != nil {
		log.Printf("❌ Failed to generate UUID: %v", err)
	}
	return sessionToken.String()
}

// CheckIfSessionExist checks if a session exists for a given username.
func CheckIfSessionExist(username string) bool {
	exist := false
	AllSessions.Range(func(_, value interface{}) bool {
		if value.(Session).Nickname == username {
			exist = true
		}
		return true
	})
	return exist
}

// DeleteExpiredSessions periodically deletes expired sessions.
func DeleteExpiredSessions() {
	for range time.Tick(10 * time.Second) {
		AllSessions.Range(func(key, value interface{}) bool {
			if value.(Session).isExpired() {
				AllSessions.Delete(key)
			}
			return true
		})
	}
}

// DeleteSession deletes a session associated with a given request.
func DeleteSession(req *http.Request) bool {
	cookie, err := req.Cookie("auth_session")
	log.Println("❌ Deleting session:", cookie.Value)
	if err == nil {
		AllSessions.Delete(cookie.Value)
		return true
	}
	return false
}
