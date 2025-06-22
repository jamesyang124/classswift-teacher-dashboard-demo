package model

import (
	"github.com/gorilla/websocket"
)

// Client represents a WebSocket client connection
type Client struct {
	Conn    *websocket.Conn
	ClassID string
}

// WebSocketHub manages WebSocket connections for a class
type WebSocketHub struct {
	// Registered clients for each class
	Clients map[string]map[*websocket.Conn]bool

	// Channel for broadcasting messages to clients
	Broadcast chan WebSocketMessage

	// Register requests from clients
	Register chan *Client

	// Unregister requests from clients
	Unregister chan *Client
}