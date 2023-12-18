package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"real-time-forum/data/models"
	"real-time-forum/lib"
	"strings"
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
	if lib.ValidateRequest(req, res, "/chat/messages/*", http.MethodGet) {
		isLogin := models.ValidSession(req)
		if isLogin {
			user := models.GetUserFromSession(req)
			path := req.URL.Path
			pathPart := strings.Split(path, "/")
			idReceiver := pathPart[3]
			messages, err := models.MessageRepo.GetDiscussionsBetweenUsers(user.ID, idReceiver)
			if err != nil {
				lib.HandleError(res, http.StatusInternalServerError, "Error getting messages : "+err.Error())
				return
			}
			talker, err := models.UserRepo.GetUserByID(idReceiver)
			log.Println(idReceiver)
			log.Println(talker)
			if err != nil {
				lib.HandleError(res, http.StatusInternalServerError, "Error getting talker : "+err.Error())
				return
			}

			lib.SendJSONResponse(res, http.StatusOK, map[string]any{"messages": messages, "talker": talker})
		} else {
			lib.HandleError(res, http.StatusUnauthorized, "No active session")
		}
	}
}

func GetTalker(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/chat/user/*", http.MethodGet) {
		isLogin := models.ValidSession(req)
		if isLogin {
			path := req.URL.Path
			pathPart := strings.Split(path, "/")
			idReceiver := pathPart[3]
			talker, err := models.UserRepo.GetUserByID(idReceiver)
			if err != nil {
				lib.HandleError(res, http.StatusInternalServerError, "Error getting talker : "+err.Error())
				return
			}

			lib.SendJSONResponse(res, http.StatusOK, map[string]any{"talker": talker})
		} else {
			lib.HandleError(res, http.StatusUnauthorized, "No active session")
		}
	}
}

func NewMessage(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/chat/new", http.MethodPost) {
		isLogin := models.ValidSession(req)
		if isLogin {
			_ = models.GetUserFromSession(req)
			var message models.Message
			if err := json.NewDecoder(req.Body).Decode(&message); err != nil {
				lib.HandleError(res, http.StatusBadRequest, "Invalid JSON format")
				return
			}
			err := models.MessageRepo.CreateMessage(&message)
			if err != nil {
				lib.HandleError(res, http.StatusInternalServerError, "Error creating message : "+err.Error())
			}
			lib.SendJSONResponse(res, http.StatusOK, map[string]any{"message": message})
			SendMessage(message)
		} else {
			lib.HandleError(res, http.StatusUnauthorized, "No active session")
		}
	}
}
