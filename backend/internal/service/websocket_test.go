package service

import (
	"testing"
	"time"

	"classswift-backend/internal/model"
	"classswift-backend/pkg/utils"
)

func TestInitWebSocketHub(t *testing.T) {
	// Reset global wsManager
	wsManager = nil

	InitWebSocketHub()

	if wsManager == nil {
		t.Error("Expected wsManager to be initialized, got nil")
	}

	// Clean up
	wsManager = nil
}

func TestRegisterClient_NilManager(t *testing.T) {
	// Ensure wsManager is nil
	wsManager = nil

	client := &model.Client{
		ClassID: "test-class",
	}

	// Should not panic when wsManager is nil
	RegisterClient(client)
}

func TestUnregisterClient_NilManager(t *testing.T) {
	// Ensure wsManager is nil
	wsManager = nil

	client := &model.Client{
		ClassID: "test-class",
	}

	// Should not panic when wsManager is nil
	UnregisterClient(client)
}

func TestBroadcastClassUpdate_NilManager(t *testing.T) {
	// Ensure wsManager is nil
	wsManager = nil

	data := map[string]interface{}{
		"totalCapacity":  30,
		"enrolledCount":  15,
		"availableSlots": 15,
	}

	// Should not panic when wsManager is nil
	BroadcastClassUpdate("test-class", "class_updated", data)
}

func TestBroadcastClassUpdate_WithManager(t *testing.T) {
	// Create a mock WebSocket manager
	mockManager := utils.NewWebSocketManager()
	wsManager = mockManager

	testClassID := "test-class-123"
	testUpdateType := "class_updated"
	testData := map[string]interface{}{
		"totalCapacity":  30,
		"enrolledCount":  20,
		"availableSlots": 10,
	}

	// Start the manager to handle broadcasts
	mockManager.Start()

	// Give some time for the goroutine to start
	time.Sleep(10 * time.Millisecond)

	// Should not panic with valid manager
	BroadcastClassUpdate(testClassID, testUpdateType, testData)

	// Verify message was sent by checking the broadcast channel
	// We can't easily test the actual broadcast without mocking WebSocket connections
	// but we can verify the function doesn't panic

	// Clean up
	wsManager = nil
}

func TestRegisterUnregisterClient_WithManager(t *testing.T) {
	// Create a mock WebSocket manager
	mockManager := utils.NewWebSocketManager()
	wsManager = mockManager

	client := &model.Client{
		ClassID: "test-class",
	}

	// Start the manager
	mockManager.Start()
	time.Sleep(10 * time.Millisecond)

	// Test register
	RegisterClient(client)

	// Test unregister
	UnregisterClient(client)

	// Clean up
	wsManager = nil
}

func TestWebSocketServiceIntegration(t *testing.T) {
	// Test the full flow: init -> register -> broadcast -> unregister
	InitWebSocketHub()

	if wsManager == nil {
		t.Fatal("Failed to initialize WebSocket manager")
	}

	client := &model.Client{
		ClassID: "integration-test-class",
	}

	// Register client
	RegisterClient(client)

	// Broadcast a message
	testData := map[string]interface{}{
		"message": "test broadcast",
	}
	BroadcastClassUpdate("integration-test-class", "test_event", testData)

	// Unregister client
	UnregisterClient(client)

	// Clean up
	wsManager = nil
}