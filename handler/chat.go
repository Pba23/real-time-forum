package handler

import (
	"net/http"
	"real-time-forum/data/models"
	"real-time-forum/lib"
)

func GetUsers(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/chat/users", http.MethodGet) {
		isLogin := models.ValidSession(req)
		if isLogin {
			user := models.GetUserFromSession(req)
			users, err := models.UserRepo.SelectAllUsers(user.ID)
			if err != nil {
				lib.HandleError(res, http.StatusInternalServerError, "Error getting users : "+err.Error())
				return
			}
			for i := 0; i < len(users); i++ {
				if models.CheckIfSessionExist(users[i].Nickname) {
					users[i].IsConnected = true
				}
			}
			lib.SendJSONResponse(res, http.StatusOK, map[string]any{"users": users})
		} else {
			lib.HandleError(res, http.StatusUnauthorized, "No active session")
		}
	}
}

func GetMessages(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/chat/messages", http.MethodGet) {
		isLogin := models.ValidSession(req)
		if isLogin {
			_ = models.GetUserFromSession(req)

		} else {
			lib.HandleError(res, http.StatusUnauthorized, "No active session")
		}
	}
}

func NewMessage(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/chat/new", http.MethodGet) {
		isLogin := models.ValidSession(req)
		if isLogin {
			_ = models.GetUserFromSession(req)

			// SendMessage(data)
		} else {
			lib.HandleError(res, http.StatusUnauthorized, "No active session")
		}
	}
}
