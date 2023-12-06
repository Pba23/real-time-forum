package handler

import (
	"net/http"
	"real-time-forum/data/models"
	"real-time-forum/lib"
)

type SignPageData struct {
	IsLoggedIn  bool
	RandomUsers []models.User
	Err         string
	Categories  []*models.Category
}

func SignUp(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/sign-up", http.MethodPost) {

	}
}

func SignIn(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/sign-in", http.MethodPost) {

	}
}

func Logout(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/logout", http.MethodGet) {

	}
}
