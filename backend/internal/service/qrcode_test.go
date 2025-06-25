package service_test

import (
	"encoding/base64"
	"strings"
	"testing"

	"classswift-backend/config"
	"classswift-backend/internal/service"
)

func TestGenerateClassQRCode(t *testing.T) {
	config.Init()
	classID := "TESTCLASS123"
	joinURL, base64QR, err := service.GenerateClassQRCode(classID, false)

	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	if !strings.Contains(joinURL, classID) {
		t.Errorf("Join URL does not contain class ID: got %s", joinURL)
	}

	if !strings.Contains(joinURL, "/api/v1/classes/") {
		t.Errorf("Join URL does not contain expected path: got %s", joinURL)
	}

	if base64QR == "" {
		t.Error("Expected non-empty base64 QR code string")
	}

	// Check if base64QR is valid base64
	_, err = base64.StdEncoding.DecodeString(base64QR)
	if err != nil {
		t.Errorf("base64QR is not valid base64: %v", err)
	}
}
