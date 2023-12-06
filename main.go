package main

import (
	"real-time-forum/data/models"
	"real-time-forum/handlers"
	"real-time-forum/lib"
	"log"
	"net/http"
	"os"
	"time"
)

//! TODO: CHANGE ROUTES WITH GORILLA MUX
func main() {
	PORT := ":" + os.Getenv("PORT")
	ADDRESS := os.Getenv("ADDRESS")

	rateLimiter := lib.NewRateLimiter(time.Minute)

	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("./assets/styles/"))))
	http.Handle("/img/", http.StripPrefix("/img/", http.FileServer(http.Dir("./assets/img/"))))
	http.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/"))))

	// Login/authentication rate limiting
	http.Handle("/sign-up", rateLimiter.Wrap("auth", handler.SignUp))
	http.Handle("/sign-in", rateLimiter.Wrap("auth", handler.SignIn))
	http.Handle("/logout", rateLimiter.Wrap("auth", handler.Logout))

	go models.DeleteExpiredSessions()

	log.Print("Server started and running on ")
	log.Println(ADDRESS + PORT)
	if err := http.ListenAndServe(PORT, nil); err != nil {
		log.Fatal(err)
	}
}