package handler_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"classswift-backend/internal/handler"

	"github.com/gin-gonic/gin"
)

func TestGetHealth(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	handler.GetHealth(c)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}
