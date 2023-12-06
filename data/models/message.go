package models

import (
	"database/sql"
	"log"

	uuid "github.com/gofrs/uuid"
	_ "github.com/mattn/go-sqlite3"
)

type Message struct {
	ID           string
	SenderID     string
	ReceiverID     string
	Text         string
	CreateDate   string
	ModifiedDate string
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
		log.Fatalf("❌ Failed to generate UUID: %v", err)
	}
	message.ID = ID.String()
	_, err = rr.db.Exec("INSERT INTO message (id, senderID, receiverID, content, createDate, modifiedDate) VALUES (?, ?, ?, ?, ?, ?)",
		message.ID, message.SenderID, message.ReceiverID, message.Text, message.CreateDate, message.ModifiedDate)
	return err
}
func (rr *MessageRepository) GetAllMessage() ([]Message, error) {
	var Messagetab []Message
	rows, err := rr.db.Query("SELECT id, senderID, receiverID, content, createDate, modifiedDate FROM message ORDER BY modifiedDate DESC")

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var message Message
		err := rows.Scan(&message.ID, &message.SenderID, &message.ReceiverID, &message.Text, &message.CreateDate, &message.ModifiedDate)

		if err != nil {
			return nil, err
		}

		Messagetab = append(Messagetab, message)
	}

	return Messagetab, nil

}

// Get a message by ID from the database
func (rr *MessageRepository) GetMessageByID(messageID string) (*Message, error) {
	var message Message
	row := rr.db.QueryRow("SELECT id, senderID, receiverID, content, createDate, modifiedDate FROM message WHERE id = ?", messageID)
	err := row.Scan(&message.ID, &message.SenderID, &message.ReceiverID, &message.Text, &message.CreateDate, &message.ModifiedDate)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Message not found
		}
		return nil, err
	}
	return &message, nil
}

// Update a message in the database
func (rr *MessageRepository) Updatemessage(message *Message) error {
	_, err := rr.db.Exec("UPDATE message SET senderID = ?, receiverID = ?, text = ?, createDate = ?, modifiedDate = ? WHERE id = ?",
		message.SenderID, message.ReceiverID, message.Text, message.CreateDate, message.ModifiedDate, message.ID)
	return err
}

// Delete a message from the database
func (rr *MessageRepository) Deletemessage(messageID string) error {
	_, err := rr.db.Exec("DELETE FROM message WHERE id = ?", messageID)
	return err
}
