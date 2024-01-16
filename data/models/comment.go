package models

import (
	"database/sql"
	"log"
	"real-time-forum/lib"

	uuid "github.com/gofrs/uuid"
	_ "github.com/mattn/go-sqlite3"
)

type Comment struct {
	ID         string `json:"id"`
	Text       string `json:"text"`
	AuthorID   string `json:"authorID"`
	PostID     string `json:"postID"`
	CreateDate string `json:"createDate"`
}

type CommentItem struct {
	ID             string `json:"id"`
	Text           string `json:"text"`
	AuthorID       string `json:"authorID"`
	AuthorName     string `json:"authorName"`
	AuthorAvatar   string `json:"authorAvatar"`
	LastCreateDate string `json:"lastCreateDate"`
}

type CommentRepository struct {
	db *sql.DB
}

func NewCommentRepository(db *sql.DB) *CommentRepository {
	return &CommentRepository{
		db: db,
	}
}

// Create a new comment in the database
func (cr *CommentRepository) CreateComment(comment *Comment) error {
	ID, err := uuid.NewV4()
	if err != nil {
		log.Printf("❌ Failed to generate UUID: %v", err)
	}
	comment.ID = ID.String()
	_, err = cr.db.Exec("INSERT INTO comment (id, text, authorID, postID) VALUES (?, ?, ?, ?)",
		comment.ID, comment.Text, comment.AuthorID, comment.PostID)
	return err
}

// Get a comment by ID from the database
func (cr *CommentRepository) GetCommentByID(id string) (CommentItem, error) {
	var comment CommentItem
	row := cr.db.QueryRow("SELECT c.id, c.text, c.authorID, c.createDate, u.nickName, u.avatarURL FROM comment c LEFT JOIN user u ON c.authorID = u.ID WHERE c.id = ?", id)

	err := row.Scan(&comment.ID, &comment.Text, &comment.AuthorID, &comment.LastCreateDate, &comment.AuthorName, &comment.AuthorAvatar)
	if err != nil {
		return comment, err
	}
	comment.LastCreateDate = lib.FormatDateDB(comment.LastCreateDate)

	return comment, nil
}

func (cr *CommentRepository) GetCommentsOfPost(postID string) ([]*CommentItem, error) {
	var comments []*CommentItem

	rows, err := cr.db.Query("SELECT c.id, c.text, c.authorID, c.createDate, u.nickName, u.avatarURL FROM comment c LEFT JOIN user u ON c.authorID = u.ID WHERE c.PostID = ? ORDER BY createDate DESC", postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var comment CommentItem
		err := rows.Scan(&comment.ID, &comment.Text, &comment.AuthorID, &comment.LastCreateDate, &comment.AuthorName, &comment.AuthorAvatar)
		if err != nil {
			return nil, err
		}
		comment.LastCreateDate = lib.FormatDateDB(comment.LastCreateDate)
		comments = append(comments, &comment)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return comments, nil
}
