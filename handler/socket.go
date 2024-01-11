package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"real-time-forum/data/models"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	upgrader        = websocket.Upgrader{}
	UserConnections = &sync.Map{}
)

type wsInput struct {
	Type string                 `json:"type"`
	Data map[string]interface{} `json:"data"`
}

type NewPostEvent struct {
	Type string          `json:"type"`
	Data models.PostItem `json:"post"`
}

type NewCommentEvent struct {
	Type   string             `json:"type"`
	PostID string             `json:"postID"`
	Data   models.CommentItem `json:"comment"`
}

type NewStatusEvent struct {
	Type   string `json:"type"`
	UserID string `json:"userID"`
	Online bool   `json:"online"`
}

type TokenExpiredEvent struct {
	Type   string `json:"type"`
	UserID string `json:"userID"`
}

type NewMessageEvent struct {
	Type    string         `json:"type"`
	Message models.Message `json:"message"`
}

func HandleWebSocket(res http.ResponseWriter, req *http.Request) {
	conn, err := upgrader.Upgrade(res, req, nil)
	if err != nil {
		log.Println("Error upgrading connection", err)
		return
	}
	
	UserConnections.Store(conn, "")
	defer UserConnections.Delete(conn)
	defer conn.Close()
	for {
		_, incoming, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading message", err)
			return
		}
		var data wsInput
		if err := json.Unmarshal([]byte(incoming), &data); err != nil {
			log.Println("Error unmarshalling message", err)
			return
		}
		switch data.Type {
		case "login":
			log.Println(data.Data["userID"])
			UserConnections.Store(conn, data.Data["userID"])
			SendStatus(data.Data["userID"].(string), true)
			// defer SendStatus(data.Data["userID"].(string), false)
		case "logout":
			UserConnections.Store(conn, "")
			SendStatus(data.Data["userID"].(string), false)
		}
	}
}

func SendPost(post models.PostItem) {
	data := NewPostEvent{"post", post}
	output, err := json.Marshal(data)
	if err != nil {
		log.Println(err)
	}
	UserConnections.Range(func(key, value interface{}) bool {
		if c, ok := key.(*websocket.Conn); ok {
			c.WriteMessage(websocket.TextMessage, output)
		}
		return true
	})
}

func SendComment(postID string, comment models.CommentItem) {
	data := NewCommentEvent{"comment", postID, comment}
	output, err := json.Marshal(data)
	if err != nil {
		log.Println(err)
	}
	UserConnections.Range(func(key, value interface{}) bool {
		if c, ok := key.(*websocket.Conn); ok {
			c.WriteMessage(websocket.TextMessage, output)
		}
		return true
	})
}

func SendStatus(userID string, online bool) {
	data := NewStatusEvent{"status", userID, online}
	output, err := json.Marshal(data)
	if err != nil {
		log.Println(err)
	}
	UserConnections.Range(func(key, value interface{}) bool {
		if value.(string) != "" && value.(string) != userID {
			log.Println(data.Online, value)
			key.(*websocket.Conn).WriteMessage(websocket.TextMessage, output)
		}
		return true
	})
}

func SendTokenExpired(userID string) {
	data := TokenExpiredEvent{"token-expired", userID}
	output, err := json.Marshal(data)
	if err != nil {
		log.Println(err)
	}
	UserConnections.Range(func(key, value interface{}) bool {
		if value.(string) != "" && value.(string) != userID {
			key.(*websocket.Conn).WriteMessage(websocket.TextMessage, output)
		}
		return true
	})
}

func SendMessage(message models.Message) {
	data := NewMessageEvent{"message", message}
	output, err := json.Marshal(data)
	if err != nil {
		log.Println(err)
	}
	UserConnections.Range(func(key, value interface{}) bool {
		if value.(string) == message.SenderID || value.(string) == message.ReceiverID {
			key.(*websocket.Conn).WriteMessage(websocket.TextMessage, output)
		}
		if message.SenderID == message.ReceiverID {
			log.Println("🚨 Sender and receiver are the same")
			return false
		}
		return true
	})
}
