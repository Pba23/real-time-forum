package models

import (
	"database/sql"
	"log"
	"real-time-forum/lib"
	"strings"

	uuid "github.com/gofrs/uuid"
	_ "github.com/mattn/go-sqlite3"
)

type Comment struct {
	ID           string `json:"id"`
	Text         string `json:"text"`
	AuthorID     string `json:"authorID"`
	PostID       string `json:"postID"`
	ParentID     string `json:"parentID"`
	ModifiedDate string `json:"modifiedDate"`
	CreateDate   string `json:"createDate"`
}

type CommentItem struct {
	ID                 string `json:"id"`
	Index              int    `json:"index"`
	Depth              string `json:"depth"`
	Text               string `json:"text"`
	AuthorID           string `json:"authorID"`
	AuthorName         string `json:"authorName"`
	AuthorAvatar       string `json:"authorAvatar"`
	ParentID           string `json:"parentID"`
	LastModifiedDate   string `json:"lastModifiedDate"`
	NbrLikesComment    int    `json:"nbrLikesComment"`
	NbrDislikesComment int    `json:"nbrDislikesComment"`
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
	_, err = cr.db.Exec("INSERT INTO comment (id, text, authorID, postID, parentID) VALUES (?, ?, ?, ?, ?)",
		comment.ID, comment.Text, comment.AuthorID, comment.PostID, comment.ParentID)
	return err
}

// Get a comment by ID from the database
func (cr *CommentRepository) GetCommentByID(id string) (CommentItem, error) {
	var comment CommentItem
	row := cr.db.QueryRow("SELECT c.id, c.text, c.authorID, c.parentID, c.modifiedDate, u.nickName, u.avatarURL FROM comment c LEFT JOIN user u ON c.authorID = u.ID WHERE c.id = ?", id)

	err := row.Scan(&comment.ID, &comment.Text, &comment.AuthorID, &comment.ParentID, &comment.LastModifiedDate, &comment.AuthorName, &comment.AuthorAvatar)
	if err != nil {
		return comment, err
	}
	comment.LastModifiedDate = strings.ReplaceAll(comment.LastModifiedDate, "T", " ")
	comment.LastModifiedDate = strings.ReplaceAll(comment.LastModifiedDate, "Z", "")
	comment.LastModifiedDate = lib.TimeSinceCreation(comment.LastModifiedDate)
	comment.NbrLikesComment, err = CommentRateRepo.GetLikesByComment(comment.ID)
	if err != nil {
		return comment, err
	}
	comment.NbrDislikesComment, err = CommentRateRepo.GetDislikesByComment(comment.ID)
	if err != nil {
		return comment, err
	}

	return comment, nil
}

func (cr *CommentRepository) GetCommentsOfPost(postID string) ([]*CommentItem, error) {
	var comments []*CommentItem

	rows, err := cr.db.Query("SELECT c.id, c.text, c.authorID, c.parentID, c.modifiedDate, u.nickName, u.avatarURL FROM comment c LEFT JOIN user u ON c.authorID = u.ID WHERE c.PostID = ?", postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var comment CommentItem
		err := rows.Scan(&comment.ID, &comment.Text, &comment.AuthorID, &comment.ParentID, &comment.LastModifiedDate, &comment.AuthorName, &comment.AuthorAvatar)
		if err != nil {
			return nil, err
		}
		comment.LastModifiedDate = strings.ReplaceAll(comment.LastModifiedDate, "T", " ")
		comment.LastModifiedDate = strings.ReplaceAll(comment.LastModifiedDate, "Z", "")
		comment.LastModifiedDate = lib.TimeSinceCreation(comment.LastModifiedDate)
		comment.NbrLikesComment, err = CommentRateRepo.GetLikesByComment(comment.ID)
		if err != nil {
			return nil, err
		}
		comment.NbrDislikesComment, err = CommentRateRepo.GetDislikesByComment(comment.ID)
		if err != nil {
			return nil, err
		}
		comments = append(comments, &comment)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return comments, nil
}

// Update a comment in the database
func (cr *CommentRepository) UpdateComment(comment *Comment) error {
	_, err := cr.db.Exec("UPDATE comment SET text = ?, authorID = ?, postID = ?, parentID = ?, createDate = ?, modifiedDate = ? WHERE id = ?",
		comment.Text, comment.AuthorID, comment.PostID, comment.ParentID, comment.CreateDate, comment.ModifiedDate, comment.ID)
	return err
}

// Delete a comment from the database
func (cr *CommentRepository) DeleteComment(commentID string) error {
	_, err := cr.db.Exec("DELETE FROM comment WHERE id = ?", commentID)
	return err
}
