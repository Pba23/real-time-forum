package models

import (
	"database/sql"
	"log"
	"strings"

	uuid "github.com/gofrs/uuid"
	_ "github.com/mattn/go-sqlite3"
)

type Message struct {
	ID         string `json:"id"`
	SenderID   string `json:"authorID"`
	SenderName string `json:"authorName"`
	ReceiverID string `json:"receiverID"`
	Content    string `json:"text"`
	CreateDate string `json:"createDate"`
}

type MessageRepository struct {
	db *sql.DB
}

func NewMessageRepository(db *sql.DB) *MessageRepository {
	return &MessageRepository{
		db: db,
	}
}

// Create a new message in the database
func (rr *MessageRepository) CreateMessage(message *Message) error {
	ID, err := uuid.NewV4()
	if err != nil {
		log.Printf("❌ Failed to generate UUID: %v", err)
	}
	message.ID = ID.String()
	_, err = rr.db.Exec("INSERT INTO message (id, senderID, receiverID, content) VALUES (?, ?, ?, ?)",
		message.ID, message.SenderID, message.ReceiverID, message.Content)
	if err != nil {
		log.Printf("❌ Failed to insert message into the database: %v", err)
		return err
	}
	return err
}

// GetDiscussionsBetweenUsersWithPagination retrieves discussions between two users with pagination.
func (rr *MessageRepository) GetDiscussionsBetweenUsersWithPagination(user1ID, user2ID string, offset, limit int) ([]*Message, error) {
	var discussions []*Message

	rows, err := rr.db.Query(`
		SELECT id, senderID, receiverID, content, createDate
		FROM message
		WHERE (senderID = ? AND receiverID = ?) OR (senderID = ? AND receiverID = ?)
		ORDER BY createDate DESC
		LIMIT ? OFFSET ?
	`, user1ID, user2ID, user2ID, user1ID, limit, offset)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
	}
	defer rows.Close()

	for rows.Next() {
		var message Message
		err := rows.Scan(&message.ID, &message.SenderID, &message.ReceiverID, &message.Content, &message.CreateDate)
		if err != nil {
			return nil, err
		}
		// message.CreateDate = lib.FormatDateDB(message.CreateDate)
		message.CreateDate = strings.ReplaceAll(message.CreateDate, "T", " ")
		message.CreateDate = strings.ReplaceAll(message.CreateDate, "Z", "")
		discussions = append(discussions, &message)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return discussions, nil
}

func (mr *MessageRepository) GetAllMessages() ([]Message, error) {
	var messageList []Message
	rows, err := mr.db.Query("SELECT id, senderID, receiverID, content, createDate FROM message ORDER BY createDate DESC")

	if err != nil {
		log.Printf("❌ Failed to get messages from the database: %v", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var message Message
		err := rows.Scan(&message.ID, &message.SenderID, &message.ReceiverID, &message.Content, &message.CreateDate)

		if err != nil {
			log.Printf("❌ Failed to scan message rows: %v", err)
			return nil, err
		}

		// message.CreateDate = lib.FormatDateDB(message.CreateDate)
		message.CreateDate = strings.ReplaceAll(message.CreateDate, "T", " ")
		message.CreateDate = strings.ReplaceAll(message.CreateDate, "Z", "")
		messageList = append(messageList, message)
	}

	return messageList, nil
}

// Get a message by ID from the database
func (rr *MessageRepository) GetMessageByID(messageID string) (*Message, error) {
	var message Message
	row := rr.db.QueryRow(`
		SELECT m.id, m.senderID, m.receiverID, m.content, m.createDate, u.nickname as senderName
		FROM message m
		JOIN user u ON m.senderID = u.id
		WHERE m.id = ?
	`, messageID)

	err := row.Scan(&message.ID, &message.SenderID, &message.ReceiverID, &message.Content, &message.CreateDate, &message.SenderName)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Message not found
		}
		return nil, err
	}
	return &message, nil
}
