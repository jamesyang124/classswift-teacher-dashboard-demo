package handler

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"classswift-backend/internal/model"
	"classswift-backend/internal/service"
)

func TestHandleWebSocket_MissingClassID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Create request without classId parameter
	req := httptest.NewRequest("GET", "/ws", nil)
	c.Request = req

	HandleWebSocket(c)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}

	expectedMessage := "Class ID is required"
	if !strings.Contains(w.Body.String(), expectedMessage) {
		t.Errorf("Expected response to contain '%s', got %s", expectedMessage, w.Body.String())
	}
}

func TestHandleWebSocket_WithClassID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	// Initialize WebSocket hub for testing
	service.InitWebSocketHub()

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Set classId parameter
	c.Params = []gin.Param{
		{Key: "classId", Value: "test-class-123"},
	}

	// Create a request WITHOUT WebSocket headers to avoid the upgrade attempt
	req := httptest.NewRequest("GET", "/classes/test-class-123/ws", nil)
	c.Request = req

	// This will attempt the WebSocket upgrade and fail gracefully
	// Since httptest.ResponseRecorder doesn't support hijacking,
	// the upgrader will return an error, but the function should handle it
	HandleWebSocket(c)

	// We can't test successful WebSocket upgrade with httptest.ResponseRecorder,
	// but we can verify the function doesn't panic with a valid classId
}

func TestUpgraderOriginCheck(t *testing.T) {
	// Test that our upgrader allows all origins (for development)
	req := httptest.NewRequest("GET", "/ws", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	
	allowed := upgrader.CheckOrigin(req)
	if !allowed {
		t.Error("Expected upgrader to allow all origins for development")
	}

	// Test with different origin
	req.Header.Set("Origin", "https://example.com")
	allowed = upgrader.CheckOrigin(req)
	if !allowed {
		t.Error("Expected upgrader to allow all origins for development")
	}
}

func TestWebSocketHandlerIntegration(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	// Initialize WebSocket service
	service.InitWebSocketHub()

	// Create a test router
	r := gin.New()
	r.GET("/classes/:classId/ws", HandleWebSocket)

	// Test missing classId
	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/classes//ws", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d for missing classId, got %d", http.StatusBadRequest, w.Code)
	}

	// Test with valid classId but invalid WebSocket headers
	w = httptest.NewRecorder()
	req = httptest.NewRequest("GET", "/classes/valid-class/ws", nil)
	r.ServeHTTP(w, req)

	// Should attempt WebSocket upgrade and fail gracefully
	// The exact response depends on the upgrader's behavior
}

// MockWebSocketConnection simulates WebSocket behavior for testing
type MockWebSocketConnection struct {
	messages [][]byte
	closed   bool
}

func (m *MockWebSocketConnection) WriteMessage(messageType int, data []byte) error {
	if m.closed {
		return websocket.ErrCloseSent
	}
	m.messages = append(m.messages, data)
	return nil
}

func (m *MockWebSocketConnection) Close() error {
	m.closed = true
	return nil
}

func TestWebSocketClient(t *testing.T) {
	// Test the Client struct
	client := &model.Client{
		ClassID: "test-class",
	}

	if client.ClassID != "test-class" {
		t.Errorf("Expected ClassID to be 'test-class', got %s", client.ClassID)
	}

	if client.Conn != nil {
		t.Error("Expected Conn to be nil initially")
	}
}