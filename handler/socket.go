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
	PostID int                `json:"postID"`
	Data   models.CommentItem `json:"comment"`
}

type NewStatusEvent struct {
	Type     string `json:"type"`
	Username string `json:"username"`
	Online   bool   `json:"online"`
}

type NewMessageEvent struct {
	Type    string         `json:"type"`
	Message models.Message `json:"message"`
}

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	UserConnections.Store(conn, "")
	defer UserConnections.Delete(conn)
	defer conn.Close()
	for {
		_, incoming, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		var data wsInput
		if err := json.Unmarshal([]byte(incoming), &data); err != nil {
			log.Println(err)
			return
		}
		switch data.Type {
		case "login":
			UserConnections.Store(conn, data.Data["username"])
			SendStatus(data.Data["username"].(string), true)
			defer SendStatus(data.Data["username"].(string), false)
		case "logout":
			conn.Close()
			UserConnections.Delete(conn)
			SendStatus(data.Data["username"].(string), false)
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

func SendComment(postID int, comment models.CommentItem) {
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

func SendStatus(username string, online bool) {
	data := NewStatusEvent{"status", username, online}
	output, err := json.Marshal(data)
	if err != nil {
		log.Println(err)
	}
	UserConnections.Range(func(key, value interface{}) bool {
		if value.(string) != "" {
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
		return true
	})
}
