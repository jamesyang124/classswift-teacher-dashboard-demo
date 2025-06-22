package service

import (
	"time"

	"classswift-backend/internal/model"
	"classswift-backend/pkg/utils"
)

// Global WebSocket manager instance
var wsManager *utils.WebSocketManager

// InitWebSocketHub initializes the global WebSocket hub
func InitWebSocketHub() {
	wsManager = utils.NewWebSocketManager()
	wsManager.Start()
}

// RegisterClient registers a WebSocket client with the hub
func RegisterClient(client *model.Client) {
	if wsManager == nil {
		return
	}
	wsManager.RegisterClient(client)
}

// UnregisterClient unregisters a WebSocket client from the hub
func UnregisterClient(client *model.Client) {
	if wsManager == nil {
		return
	}
	wsManager.UnregisterClient(client)
}


// BroadcastClassUpdate broadcasts general class updates
func BroadcastClassUpdate(classID string, updateType string, data interface{}) {
	if wsManager == nil {
		return
	}

	message := model.WebSocketMessage{
		Type:      updateType,
		ClassID:   classID,
		Data:      data,
		Timestamp: time.Now(),
	}

	wsManager.Broadcast(message)
}
