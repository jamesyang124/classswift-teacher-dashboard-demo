package e2e

import (
	"net/http"
	"os"
	"testing"
)

// Example E2E test: join class endpoint (would require running backend server)
func TestJoinClassE2E(t *testing.T) {
	baseURL := os.Getenv("E2E_BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8081"
	}
	resp, err := http.Get(baseURL + "/api/v1/classes/X58E9647/join")
	if err != nil {
		t.Fatalf("Failed to call join endpoint: %v", err)
	}
	if resp.StatusCode != http.StatusFound && resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 302 or 200, got %d", resp.StatusCode)
	}
}

func TestHealthCheckE2E(t *testing.T) {
	baseURL := os.Getenv("E2E_BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8081"
	}
	resp, err := http.Get(baseURL + "/health")
	if err != nil {
		t.Fatalf("Failed to call health endpoint: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200, got %d", resp.StatusCode)
	}
}

func TestGetClassesE2E(t *testing.T) {
	baseURL := os.Getenv("E2E_BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8081"
	}
	resp, err := http.Get(baseURL + "/api/v1/classes/X58E9647")
	if err != nil {
		t.Fatalf("Failed to call list classes endpoint: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected 200, got %d", resp.StatusCode)
	}
}
