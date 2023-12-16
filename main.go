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
	r.PathPrefix("/js/").Handler(http.StripPrefix("/js/", http.FileServer(http.Dir("./public/js/"))))
	r.PathPrefix("/css/").Handler(http.StripPrefix("/css/", http.FileServer(http.Dir("./public/css/"))))
	r.PathPrefix("/img/").Handler(http.StripPrefix("/img/", http.FileServer(http.Dir("./public/img/"))))
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/"))))

	// Single Page
	r.Handle("/", rateLimiter.Wrap("auth", http.HandlerFunc(handler.Index)))

	// WebSocket
	r.HandleFunc("/ws", handler.HandleWebSocket)

	// Authentication
	r.Handle("/me", rateLimiter.Wrap("auth", http.HandlerFunc(handler.Me)))
	r.Handle("/sign-up", rateLimiter.Wrap("auth", http.HandlerFunc(handler.SignUp)))
	r.Handle("/sign-in", rateLimiter.Wrap("auth", http.HandlerFunc(handler.SignIn)))
	r.Handle("/logout", rateLimiter.Wrap("auth", http.HandlerFunc(handler.Logout)))

	// Post Handlers
	r.Handle("/post", rateLimiter.Wrap("api", http.HandlerFunc(handler.CreatePost)))
	r.Handle("/post/{slug}", rateLimiter.Wrap("api", http.HandlerFunc(handler.GetPost)))
	r.Handle("/posts", rateLimiter.Wrap("api", http.HandlerFunc(handler.GetAllPosts)))
	r.Handle("/edit-post/{postID}", rateLimiter.Wrap("api", http.HandlerFunc(handler.EditPost)))

	// Comment Handlers
	r.Handle("/comment/{postID}", rateLimiter.Wrap("api", http.HandlerFunc(handler.CreateComment)))
	r.Handle("/comments/{postID}", rateLimiter.Wrap("api", http.HandlerFunc(handler.GetComments)))

	// Chat Handlers
	http.HandleFunc("/chat/users", rateLimiter.Wrap("api", http.HandlerFunc(handler.GetUsers)))
	http.HandleFunc("/chat/messages", rateLimiter.Wrap("api", http.HandlerFunc(handler.GetMessages)))
	http.HandleFunc("/chat/new", rateLimiter.Wrap("api", http.HandlerFunc(handler.NewMessage)))

	go models.DeleteExpiredSessions()

	// Start the server with the Gorilla Mux router
	log.Print("Server started and running on ")
	log.Println(ADDRESS + PORT)
	if err := http.ListenAndServe(PORT, r); err != nil {
		log.Fatal(err)
	}
}
