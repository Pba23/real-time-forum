package handler

import (
	"encoding/json"
	"errors"
	"html"
	"net/http"
	"real-time-forum/data/models"
	"real-time-forum/lib"

	"github.com/mattn/go-sqlite3"
)

// SignUp handles the registration of a new user.
func SignUp(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/sign-up", http.MethodPost) {
		var user models.User
		if err := json.NewDecoder(req.Body).Decode(&user); err != nil {
			lib.HandleError(res, http.StatusBadRequest, "Invalid JSON format")
			return
		}

		// Validate user input (e.g., check if required fields are provided)
		if err := validateSignUpInput(&user); err != nil {
			lib.HandleError(res, http.StatusBadRequest, err.Error())
			return
		}

		// Hash the user's password before storing it
		hashedPassword, err := lib.HashPassword(user.Password)
		if err != nil {
			lib.HandleError(res, http.StatusInternalServerError, "Error hashing password")
			return
		}
		user.Password = hashedPassword

		// Save the user to the database
		if err := models.UserRepo.CreateUser(&user); err != nil {
			if sqliteErr, ok := err.(sqlite3.Error); ok && sqliteErr.Code == sqlite3.ErrConstraint {
				lib.HandleError(res, http.StatusConflict, "Nickname or Email already exists")
				return
			}
			lib.HandleError(res, http.StatusInternalServerError, "Error while creating user")
			return
		}

		// Respond with success
		models.NewSessionToken(res, user.ID, user.Nickname)
		authUser := models.AuthUser{
			ID:        user.ID,
			Nickname:  user.Nickname,
			Firstname: user.Firstname,
			Lastname:  user.Lastname,
			Age:       user.Age,
			Gender:    user.Gender,
			Email:     user.Email,
			AvatarURL: user.AvatarURL,
		}
		lib.SendJSONResponse(res, http.StatusOK, map[string]any{"message": "User created successfully", "user": authUser})
	}
}

// SignIn handles user authentication and login.
func SignIn(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/sign-in", http.MethodPost) {
		var loginInfo models.UserSignIn
		if err := json.NewDecoder(req.Body).Decode(&loginInfo); err != nil {
			lib.HandleError(res, http.StatusBadRequest, "Invalid JSON format")
			return
		}

		// Validate user input (e.g., check if required fields are provided)
		if err := validateSignInInput(loginInfo); err != nil {
			lib.HandleError(res, http.StatusBadRequest, err.Error())
			return
		}

		// Retrieve user from the database using email or nickname
		user, exists := models.UserRepo.IsExistedByIdentifiant(loginInfo.Identifiant)
		if !exists {
			lib.HandleError(res, http.StatusInternalServerError, "Error retrieving user")
			return
		}

		// Verify password
		if user != nil && lib.CheckPasswordHash(loginInfo.Password, user.Password) {
			// Create a new session for the authenticated user
			models.NewSessionToken(res, user.ID, user.Nickname)
			authUser := models.AuthUser{
				ID:         user.ID,
				Nickname:   user.Nickname,
				Firstname:  user.Firstname,
				Lastname:   user.Lastname,
				Age:        user.Age,
				IsLoggedIn: true,
				Gender:     user.Gender,
				Email:      user.Email,
				AvatarURL:  user.AvatarURL,
			}
			lib.SendJSONResponse(res, http.StatusOK, map[string]any{"message": "Login successful", "user": authUser})
			return
		}

		lib.HandleError(res, http.StatusUnauthorized, "Invalid credentials")
	}
}

// Logout handles user logout.
func Logout(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/logout", http.MethodDelete) {
		// Check if there is an active session
		if models.ValidSession(req) {
			// Delete the session
			models.DeleteSession(req)
			lib.SendJSONResponse(res, http.StatusOK, map[string]string{"message": "Logout successful"})
		} else {
			lib.HandleError(res, http.StatusUnauthorized, "No active session")
		}
	}
}

// Get me
func Me(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/me", http.MethodGet) {
		// Check if there is an active session
		if models.ValidSession(req) {
			user := models.GetUserFromSession(req)
			authUser := models.AuthUser{
				ID:         user.ID,
				Nickname:   user.Nickname,
				Firstname:  user.Firstname,
				Lastname:   user.Lastname,
				Age:        user.Age,
				IsLoggedIn: true,
				Gender:     user.Gender,
				Email:      user.Email,
				AvatarURL:  user.AvatarURL,
			}
			lib.SendJSONResponse(res, http.StatusOK, map[string]any{"message": "Get me successful", "user": authUser})
		} else {
			lib.HandleError(res, http.StatusUnauthorized, "No active session")
		}
	}
}

var ErrMissingRequiredFields = errors.New("missing required fields")

// validateSignUpInput validates the input data for user registration.
func validateSignUpInput(user *models.User) error {
	// Add any validation rules as needed
	if user.Nickname == "" || user.Email == "" || user.Password == "" {
		return ErrMissingRequiredFields
	}
	user.Nickname = html.EscapeString(user.Nickname)
	user.Email = html.EscapeString(user.Email)
	user.Password = html.EscapeString(user.Password)
	return nil
}

// validateSignInInput validates the input data for user login.
func validateSignInInput(loginInfo models.UserSignIn) error {
	// Add any validation rules as needed
	if loginInfo.Identifiant == "" || loginInfo.Password == "" {
		return ErrMissingRequiredFields
	}
	return nil
}
