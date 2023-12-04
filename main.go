package main

import (
	"real-time-forum/data/models"
	"real-time-forum/handler"
	"real-time-forum/handler/auth"
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
	http.Handle("/sign-up", rateLimiter.Wrap("auth", auth.SignUp))
	http.Handle("/sign-in", rateLimiter.Wrap("auth", auth.SignIn))
	http.Handle("/logout", rateLimiter.Wrap("auth", auth.Logout))

	// API endpoint rate limiting
	http.Handle("/", rateLimiter.Wrap("api", handler.Index))
	http.Handle("/bookmark/", rateLimiter.Wrap("api", handler.Bookmark))
	http.Handle("/edit-user", rateLimiter.Wrap("api", handler.EditUser))
	http.Handle("/post", rateLimiter.Wrap("api", handler.CreatePost))
	http.Handle("/delete-post/", rateLimiter.Wrap("api", handler.DeletePost))
	http.Handle("/delete-comment/", rateLimiter.Wrap("api", handler.DeleteComment))
	http.Handle("/edit-post/", rateLimiter.Wrap("api", handler.EditPost))
	http.Handle("/edit-comment/", rateLimiter.Wrap("api", handler.EditComment))
	http.Handle("/comment/", rateLimiter.Wrap("api", handler.Comment))
	http.Handle("/posts/", rateLimiter.Wrap("api", handler.GetPost))
	http.Handle("/like/", rateLimiter.Wrap("api", handler.LikePost))
	http.Handle("/dislike/", rateLimiter.Wrap("api", handler.DislikePost))
	http.Handle("/like-comment/", rateLimiter.Wrap("api", handler.LikeComment))
	http.Handle("/dislike-comment/", rateLimiter.Wrap("api", handler.DislikeComment))
	http.Handle("/category/", rateLimiter.Wrap("api", handler.GetPostOfCategory))
	http.Handle("/notification/", rateLimiter.Wrap("api", handler.GetNotifs))
	http.Handle("/posts", rateLimiter.Wrap("api", handler.SeePosts))
	
	/* httpsServer := http.Server{
		Addr: PORT,
		TLSConfig: &tls.Config{
			MinVersion:               tls.VersionTLS12, // Minimum TLS version supported
			PreferServerCipherSuites: true,             // Prefer the server's cipher suite order
			CipherSuites: []uint16{
				tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
				tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
				// Add more cipher suites as needed
			},
		},
	} */

	go models.DeleteExpiredSessions()

	log.Print("Server started and running on ")
	log.Println(ADDRESS + PORT)
	if err := http.ListenAndServe(PORT, nil); err != nil {
		log.Fatal(err)
	}
}