package handler

import (
	"classswift-backend/internal/model"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// GetHealth handles GET /health
func GetHealth(c *gin.Context) {
	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"status":    "healthy",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		},
		Message: "Service is running",
	})
}
