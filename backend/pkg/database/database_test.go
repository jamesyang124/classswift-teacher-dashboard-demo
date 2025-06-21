package database_test

import (
	"classswift-backend/pkg/database"
	"testing"
)

func TestSetAndGetDB(t *testing.T) {
	// This is a placeholder. Real DB tests would require a test DB or mocking.
	database.SetDB(nil)
	if database.GetDB() != nil {
		t.Error("Expected GetDB to return nil after SetDB(nil)")
	}
}
