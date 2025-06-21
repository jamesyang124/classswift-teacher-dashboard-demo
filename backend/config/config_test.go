package config_test

import (
	"os"
	"testing"

	"classswift-backend/config"
)

func TestInitAndBaseURL(t *testing.T) {
	os.Setenv("HOST", "testhost")
	os.Setenv("PORT", "1234")
	os.Setenv("TLS_MODE", "false")
	config.Init()
	if config.BaseURL() != "http://testhost:1234" {
		t.Errorf("Expected base URL to be http://testhost:1234, got %s", config.BaseURL())
	}
}
