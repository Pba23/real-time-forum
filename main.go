package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"real-time-forum/data/models"
	"real-time-forum/handler"
	"real-time-forum/lib"
)

func main() {
	PORT := ":" + os.Getenv("PORT")
	ADDRESS := os.Getenv("ADDRESS")

	rateLimiter := lib.NewRateLimiter(time.Minute)

	// Static file serving
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("./public/js/"))))
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("./public/css/"))))
	http.Handle("/img/", http.StripPrefix("/img/", http.FileServer(http.Dir("./public/img/"))))
	http.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/"))))

	// Single Page
	http.Handle("/", rateLimiter.Wrap("auth", http.HandlerFunc(handler.Index)))

	// Authentication
	http.Handle("/me", rateLimiter.Wrap("auth", http.HandlerFunc(handler.Me)))
	http.Handle("/sign-up", rateLimiter.Wrap("auth", http.HandlerFunc(handler.SignUp)))
	http.Handle("/sign-in", rateLimiter.Wrap("auth", http.HandlerFunc(handler.SignIn)))
	http.Handle("/logout", rateLimiter.Wrap("auth", http.HandlerFunc(handler.Logout)))

	// Post Handlers
	http.Handle("/post", rateLimiter.Wrap("api", http.HandlerFunc(handler.CreatePost)))
	http.Handle("/post/", rateLimiter.Wrap("api", http.HandlerFunc(handler.GetPost)))
	http.Handle("/posts", rateLimiter.Wrap("api", http.HandlerFunc(handler.GetAllPosts)))
	http.Handle("/edit-post/", rateLimiter.Wrap("api", http.HandlerFunc(handler.EditPost)))
	http.Handle("/comment/", rateLimiter.Wrap("api", http.HandlerFunc(handler.CreateComment)))
	http.Handle("/comments/", rateLimiter.Wrap("api", http.HandlerFunc(handler.GetComments)))

	go models.DeleteExpiredSessions()

	// Start the server with the Gorilla Mux router
	log.Print("Server started and running on ")
	log.Println(ADDRESS + PORT)
	if err := http.ListenAndServe(PORT, nil); err != nil {
		log.Fatal(err)
	}
}
