package models

import (
	"database/sql"
	"log"
	"os"
	"real-time-forum/lib"
)

var (
	UserRepo         *UserRepository
	PostRepo         *PostRepository
	CommentRepo      *CommentRepository
	CategoryRepo     *CategoryRepository
	PostCategoryRepo *PostCategoryRepository
	MessageRepo      *MessageRepository
)

func init() {
	lib.LoadEnv(".env")

	// Check if the required environment variable is set
	databaseURL := os.Getenv("DATABASE")
	if databaseURL == "" {
		log.Fatal("❌ DATABASE environment variable is not set")
	}

	// Open database connection
	db, err := sql.Open("sqlite3", databaseURL)
	if err != nil {
		log.Printf("❌ Couldn't open the database: %v", err)
	}

	// Check the viability of the database connection
	if err = db.Ping(); err != nil {
		log.Printf("❌ Connection to the database is dead: %v", err)
	}

	// Read and execute the SQL initialization script
	query, err := os.ReadFile("./data/sql/init.sql")
	if err != nil {
		log.Fatal("❌ Couldn't read init.sql:", err)
	}
	if _, err = db.Exec(string(query)); err != nil {
		log.Fatal("❌ Database setup wasn't successful:", err)
	}

	// Set up repository instances
	UserRepo = NewUserRepository(db)
	PostRepo = NewPostRepository(db)
	CommentRepo = NewCommentRepository(db)
	CategoryRepo = NewCategoryRepository(db)
	PostCategoryRepo = NewPostCategoryRepository(db)
	MessageRepo = NewMessageRepository(db)

	log.Println("✅ Database initialized successfully")
}
