package handler

import (
	"net/http"
	"real-time-forum/lib"
)

func CreatePost(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/post", http.MethodPost) {

	}
}

func EditPost(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/edit-post/*", http.MethodPost) {

	}
}

func DeletePost(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/delete-post/*", http.MethodGet) {

	}
}

func GetPost(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/posts/*", http.MethodGet) {

	}
}
