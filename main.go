package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"real-time-forum/data/models"
	"real-time-forum/handler"
	"real-time-forum/lib"

	"github.com/gorilla/mux"
)

func main() {
	PORT := ":" + os.Getenv("PORT")
	ADDRESS := os.Getenv("ADDRESS")

	rateLimiter := lib.NewRateLimiter(time.Minute)

	r := mux.NewRouter()

	// Static file serving
	r.PathPrefix("/css/").Handler(http.StripPrefix("/css/", http.FileServer(http.Dir("./assets/styles/"))))
	r.PathPrefix("/img/").Handler(http.StripPrefix("/img/", http.FileServer(http.Dir("./assets/img/"))))
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/"))))

	// Login/authentication rate limiting
	r.Handle("/", rateLimiter.Wrap("auth", http.HandlerFunc(handler.Index)))
	r.Handle("/sign-up", rateLimiter.Wrap("auth", http.HandlerFunc(handler.SignUp)))
	r.Handle("/sign-in", rateLimiter.Wrap("auth", http.HandlerFunc(handler.SignIn)))
	r.Handle("/logout", rateLimiter.Wrap("auth", http.HandlerFunc(handler.Logout)))
	r.Handle("/post", rateLimiter.Wrap("api", http.HandlerFunc(handler.CreatePost)))
	r.Handle("/edit-post/{postID}", rateLimiter.Wrap("api", http.HandlerFunc(handler.EditPost)))
	go models.DeleteExpiredSessions()

	// Start the server with the Gorilla Mux router
	log.Print("Server started and running on ")
	log.Println(ADDRESS + PORT)
	if err := http.ListenAndServe(PORT, r); err != nil {
		log.Fatal(err)
	}
}
