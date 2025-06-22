package handler

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"classswift-backend/internal/model"
	"classswift-backend/internal/service"
	"classswift-backend/pkg/logger"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow connections from any origin for development
		// In production, you should check the origin properly
		return true
	},
}

// HandleWebSocket handles WebSocket connection requests
func HandleWebSocket(c *gin.Context) {
	classID := c.Param("classId")
	if classID == "" {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Class ID is required",
			Errors:  []string{"Missing classId parameter"},
		})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		logger.Errorf("Failed to upgrade WebSocket connection: %v", err)
		return
	}

	client := &model.Client{
		Conn:    conn,
		ClassID: classID,
	}

	service.RegisterClient(client)

	// Handle client disconnection
	defer func() {
		service.UnregisterClient(client)
	}()

	// Keep connection alive and handle ping/pong
	conn.SetReadLimit(512)
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	// Read messages from client (mainly for keep-alive)
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
	}
}