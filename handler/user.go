package handler

import (
	"net/http"
	"real-time-forum/data/models"
	"real-time-forum/lib"
)

func GetUser(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/profile", http.MethodGet) {
		if models.ValidSession(req) {
			user := models.GetUserFromSession(req)
			lib.SendJSONResponse(res, http.StatusOK, map[string]any{"message": "user retrieved successfully", "user": user})
		} else {
			lib.HandleError(res, http.StatusUnauthorized, "No active session")
		}
	}
}
