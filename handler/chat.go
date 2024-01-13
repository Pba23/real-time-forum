package handler

import (
	"encoding/json"
	"net/http"
	"real-time-forum/data/models"
	"real-time-forum/lib"
	"sort"
	"strconv"
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
			sort.Slice(users, func(i, j int) bool {
				// Online users are moved to the top
				if users[i].IsConnected && !users[j].IsConnected {
					return true
				}
				// Sort by nickname if both online or both offline
				return users[i].Nickname < users[j].Nickname
			})
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

			// Parse query parameters for pagination
			pageStr := req.URL.Query().Get("page")
			limitStr := req.URL.Query().Get("limit")

			page, err := strconv.Atoi(pageStr)
			if err != nil || page < 1 {
				page = 1
			}

			limit, err := strconv.Atoi(limitStr)
			if err != nil || limit < 1 {
				limit = 10 // Default limit
			}

			// Calculate offset based on page and limit
			offset := (page - 1) * limit

			messages, err := models.MessageRepo.GetDiscussionsBetweenUsersWithPagination(user.ID, idReceiver, offset, limit)
			if err != nil {
				lib.HandleError(res, http.StatusInternalServerError, "Error getting messages: "+err.Error())
				return
			}

			talker, err := models.UserRepo.GetUserByID(idReceiver)
			if err != nil {
				lib.HandleError(res, http.StatusInternalServerError, "Error getting talker: "+err.Error())
				return
			}

			lib.SendJSONResponse(res, http.StatusOK, map[string]interface{}{"messages": messages, "talker": talker})
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
			var _message models.Message
			if err := json.NewDecoder(req.Body).Decode(&_message); err != nil {
				lib.HandleError(res, http.StatusBadRequest, "Invalid JSON format")
				return
			}
			err := models.MessageRepo.CreateMessage(&_message)
			if err != nil {
				lib.HandleError(res, http.StatusInternalServerError, "Error creating message : "+err.Error())
			}
			message, err := models.MessageRepo.GetMessageByID(_message.ID)
			if err != nil {
				lib.HandleError(res, http.StatusInternalServerError, "Error creating message : "+err.Error())
			}
			message.CreateDate = lib.FormatDateDB(message.CreateDate)
			lib.SendJSONResponse(res, http.StatusOK, map[string]any{"message": message})
			SendMessage(*message)
		} else {
			lib.HandleError(res, http.StatusUnauthorized, "No active session")
		}
	}
}
