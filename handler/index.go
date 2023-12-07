package handler

import (
	"html/template"
	"log"
	"net/http"
	"real-time-forum/lib"
)

func Index(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/", http.MethodGet) {
		files := []string{"public/index.html",}
		tpl, err := template.ParseFiles(files...)
		if err != nil {
			res.WriteHeader(http.StatusInternalServerError)
			log.Println("🚨 " + err.Error())
		} else {
			tpl.Execute(res, nil)
		}
		log.Println("✅ Home page get with success")
	}
}
