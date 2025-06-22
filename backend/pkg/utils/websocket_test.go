package utils

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/gorilla/websocket"

	"classswift-backend/internal/model"
)

func TestNewWebSocketManager(t *testing.T) {
	manager := NewWebSocketManager()

	if manager == nil {
		t.Fatal("Expected NewWebSocketManager to return a manager, got nil")
	}

	if manager.hub == nil {
		t.Error("Expected hub to be initialized")
	}

	if manager.hub.Clients == nil {
		t.Error("Expected Clients map to be initialized")
	}

	if manager.hub.Broadcast == nil {
		t.Error("Expected Broadcast channel to be initialized")
	}

	if manager.hub.Register == nil {
		t.Error("Expected Register channel to be initialized")
	}

	if manager.hub.Unregister == nil {
		t.Error("Expected Unregister channel to be initialized")
	}
}

func TestWebSocketManager_GetHub(t *testing.T) {
	manager := NewWebSocketManager()
	
	hub := manager.GetHub()
	if hub == nil {
		t.Error("Expected GetHub to return a hub, got nil")
	}

	if hub != manager.hub {
		t.Error("Expected GetHub to return the same hub instance")
	}
}

func TestWebSocketManager_RegisterClient_NilHub(t *testing.T) {
	manager := &WebSocketManager{hub: nil}
	
	client := &model.Client{
		ClassID: "test-class",
	}

	// Should not panic when hub is nil
	manager.RegisterClient(client)
}

func TestWebSocketManager_UnregisterClient_NilHub(t *testing.T) {
	manager := &WebSocketManager{hub: nil}
	
	client := &model.Client{
		ClassID: "test-class",
	}

	// Should not panic when hub is nil
	manager.UnregisterClient(client)
}

func TestWebSocketManager_Broadcast_NilHub(t *testing.T) {
	manager := &WebSocketManager{hub: nil}
	
	message := model.WebSocketMessage{
		Type:      "test_event",
		ClassID:   "test-class",
		Data:      "test data",
		Timestamp: time.Now(),
	}

	// Should not panic when hub is nil
	manager.Broadcast(message)
}

func TestWebSocketManager_Start(t *testing.T) {
	manager := NewWebSocketManager()
	
	// Start should not panic
	manager.Start()
	
	// Give some time for the goroutine to start
	time.Sleep(10 * time.Millisecond)
}

func TestWebSocketManager_RegisterUnregisterFlow(t *testing.T) {
	manager := NewWebSocketManager()
	manager.Start()
	
	// Give some time for the goroutine to start
	time.Sleep(10 * time.Millisecond)

	client := &model.Client{
		ClassID: "test-class-flow",
	}

	// Register client
	manager.RegisterClient(client)
	
	// Give some time for registration to process
	time.Sleep(10 * time.Millisecond)

	// Unregister client
	manager.UnregisterClient(client)
	
	// Give some time for unregistration to process
	time.Sleep(10 * time.Millisecond)
}

func TestWebSocketManager_BroadcastFlow(t *testing.T) {
	manager := NewWebSocketManager()
	manager.Start()
	
	// Give some time for the goroutine to start
	time.Sleep(10 * time.Millisecond)

	message := model.WebSocketMessage{
		Type:      "test_broadcast",
		ClassID:   "test-class-broadcast",
		Data:      map[string]string{"message": "hello"},
		Timestamp: time.Now(),
	}

	// Broadcast message
	manager.Broadcast(message)
	
	// Give some time for broadcast to process
	time.Sleep(10 * time.Millisecond)
}

func TestWebSocketMessage_JSONSerialization(t *testing.T) {
	message := model.WebSocketMessage{
		Type:      "student_joined",
		ClassID:   "test-class",
		Data:      map[string]interface{}{"studentId": 123, "name": "John"},
		Timestamp: time.Now(),
	}

	// Test JSON marshaling
	jsonData, err := json.Marshal(message)
	if err != nil {
		t.Errorf("Failed to marshal WebSocket message: %v", err)
	}

	// Test JSON unmarshaling
	var unmarshaled model.WebSocketMessage
	err = json.Unmarshal(jsonData, &unmarshaled)
	if err != nil {
		t.Errorf("Failed to unmarshal WebSocket message: %v", err)
	}

	if unmarshaled.Type != message.Type {
		t.Errorf("Expected Type %s, got %s", message.Type, unmarshaled.Type)
	}

	if unmarshaled.ClassID != message.ClassID {
		t.Errorf("Expected ClassID %s, got %s", message.ClassID, unmarshaled.ClassID)
	}
}

// MockConnection implements a mock WebSocket connection for testing
type MockConnection struct {
	messages [][]byte
	closed   bool
}

func (m *MockConnection) WriteMessage(messageType int, data []byte) error {
	if m.closed {
		return websocket.ErrCloseSent
	}
	m.messages = append(m.messages, data)
	return nil
}

func (m *MockConnection) Close() error {
	m.closed = true
	return nil
}

func (m *MockConnection) ReadMessage() (int, []byte, error) {
	if m.closed {
		return 0, nil, websocket.ErrCloseSent
	}
	// Simulate a ping message
	return websocket.PingMessage, []byte("ping"), nil
}

func TestWebSocketManager_WithNilConnection(t *testing.T) {
	manager := NewWebSocketManager()
	manager.Start()
	
	// Give some time for the goroutine to start
	time.Sleep(10 * time.Millisecond)

	// Test with nil connection (should be handled gracefully)
	client := &model.Client{
		Conn:    nil,
		ClassID: "nil-test-class",
	}

	// Register client with nil connection
	manager.RegisterClient(client)
	time.Sleep(10 * time.Millisecond)

	// Broadcast message
	message := model.WebSocketMessage{
		Type:      "test_nil",
		ClassID:   "nil-test-class",
		Data:      "nil data",
		Timestamp: time.Now(),
	}
	manager.Broadcast(message)
	time.Sleep(10 * time.Millisecond)

	// Unregister client with nil connection
	manager.UnregisterClient(client)
	time.Sleep(10 * time.Millisecond)
}

func TestWebSocketHub_ChannelCapacity(t *testing.T) {
	manager := NewWebSocketManager()
	hub := manager.GetHub()

	// Test channel capacities
	broadcastCap := cap(hub.Broadcast)
	registerCap := cap(hub.Register)
	unregisterCap := cap(hub.Unregister)

	if broadcastCap != 256 {
		t.Errorf("Expected Broadcast channel capacity 256, got %d", broadcastCap)
	}

	if registerCap != 256 {
		t.Errorf("Expected Register channel capacity 256, got %d", registerCap)
	}

	if unregisterCap != 256 {
		t.Errorf("Expected Unregister channel capacity 256, got %d", unregisterCap)
	}
}