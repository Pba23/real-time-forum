package handler

import (
	"net/http"
	"real-time-forum/lib"
)

func GetPostOfCategory(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/category/*", http.MethodGet) {

	}
}
