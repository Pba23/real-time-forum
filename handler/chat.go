package handler

import (
	"net/http"
	"real-time-forum/data/models"
	"real-time-forum/lib"
	"time"
)

type Users struct {
	Users []User `json:"users"`
}

type MessagesRequest struct {
	Username  string `json:"username"`
	OtherUser string `json:"otheruser"`
}

type MessagesResponse struct {
	Messages []Message `json:"messages"`
}

type Message struct {
	UsernameFrom string    `json:"usernameFrom"`
	UsernameTo   string    `json:"usernameTo"`
	Text         string    `json:"text"`
	Time         time.Time `json:"time"`
}

type User struct {
	ID          int       `json:"ID"`
	Username    string    `json:"username"`
	LastMessage time.Time `json:"time"`
	Online      bool      `json:"online"`
}

func GetUsers(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/chat/users", http.MethodGet) {
		currentUser := models.GetUserFromSession(req)
		users, err := models.UserRepo.SelectAllUsers(currentUser.ID)
		if err != nil {
			lib.HandleError(res, http.StatusInternalServerError, err.Error())
		}
		lib.SendJSONResponse(res, http.StatusOK, map[string]any{"users": users})
	}
}

func GetMessages(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/chat/messages", http.MethodGet) { }

}

func NewMessage(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/chat/new", http.MethodGet) { }

	// SendMessage(data)
}

