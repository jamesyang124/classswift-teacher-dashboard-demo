package utils

import (
	"encoding/json"
	"sync"
	"time"

	"github.com/gorilla/websocket"

	"classswift-backend/internal/model"
	"classswift-backend/pkg/logger"
)

// WebSocketManager manages WebSocket hub operations
type WebSocketManager struct {
	hub   *model.WebSocketHub
	mutex sync.RWMutex
}

// NewWebSocketManager creates a new WebSocket manager
func NewWebSocketManager() *WebSocketManager {
	return &WebSocketManager{
		hub: &model.WebSocketHub{
			Clients:    make(map[string]map[*websocket.Conn]bool),
			Broadcast:  make(chan model.WebSocketMessage, 256),
			Register:   make(chan *model.Client, 256),
			Unregister: make(chan *model.Client, 256),
		},
	}
}

// Start starts the WebSocket hub event loop
func (w *WebSocketManager) Start() {
	go w.run()
	logger.Info("WebSocket hub started")
}

// GetHub returns the WebSocket hub
func (w *WebSocketManager) GetHub() *model.WebSocketHub {
	return w.hub
}

// RegisterClient registers a WebSocket client with the hub
func (w *WebSocketManager) RegisterClient(client *model.Client) {
	if w.hub == nil {
		logger.Error("WebSocket hub not initialized")
		return
	}
	w.hub.Register <- client
}

// UnregisterClient unregisters a WebSocket client from the hub
func (w *WebSocketManager) UnregisterClient(client *model.Client) {
	if w.hub == nil {
		logger.Error("WebSocket hub not initialized")
		return
	}
	w.hub.Unregister <- client
}

// Broadcast sends a message to all clients in a class
func (w *WebSocketManager) Broadcast(message model.WebSocketMessage) {
	if w.hub == nil {
		logger.Error("WebSocket hub not initialized")
		return
	}

	select {
	case w.hub.Broadcast <- message:
		logger.Infof("Broadcasting %s event for class %s", message.Type, message.ClassID)
	default:
		logger.Error("WebSocket broadcast channel is full")
	}
}

// run starts the WebSocket hub event loop
func (w *WebSocketManager) run() {
	h := w.hub
	for {
		select {
		case client := <-h.Register:
			w.mutex.Lock()
			if client.Conn != nil {
				if h.Clients[client.ClassID] == nil {
					h.Clients[client.ClassID] = make(map[*websocket.Conn]bool)
				}
				h.Clients[client.ClassID][client.Conn] = true
				logger.Infof("Client connected to class %s. Total connections: %d",
					client.ClassID, len(h.Clients[client.ClassID]))
			}
			w.mutex.Unlock()

		case client := <-h.Unregister:
			w.mutex.Lock()
			if clients, ok := h.Clients[client.ClassID]; ok {
				if _, ok := clients[client.Conn]; ok {
					delete(clients, client.Conn)
					if client.Conn != nil {
						client.Conn.Close()
					}
					if len(clients) == 0 {
						delete(h.Clients, client.ClassID)
					}
				}
			}
			w.mutex.Unlock()
			logger.Infof("Client disconnected from class %s", client.ClassID)

		case message := <-h.Broadcast:
			w.mutex.RLock()
			clients := h.Clients[message.ClassID]
			w.mutex.RUnlock()

			if clients != nil {
				messageData, err := json.Marshal(message)
				if err != nil {
					logger.Errorf("Error marshaling WebSocket message: %v", err)
					continue
				}

				for conn := range clients {
					select {
					case <-time.After(time.Second * 1):
						// Connection write timeout
						h.Unregister <- &model.Client{Conn: conn, ClassID: message.ClassID}
					default:
						if err := conn.WriteMessage(websocket.TextMessage, messageData); err != nil {
							logger.Errorf("Error writing to WebSocket: %v", err)
							h.Unregister <- &model.Client{Conn: conn, ClassID: message.ClassID}
						}
					}
				}
			}
		}
	}
}