package handler

import (
	"log"
	"net/http"
	"real-time-forum/lib"
)

func Index(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/", http.MethodGet) {
		res.Write([]byte("Hello World"))
		log.Println("✅ Home page get with success")
	}
}
