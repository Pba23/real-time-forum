package handler

import (
	"net/http"
	"real-time-forum/lib"
)

func GetUser(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/profile", http.MethodGet) {

	}
}

func EditUser(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/edit-user", http.MethodPost) {

	}
}
