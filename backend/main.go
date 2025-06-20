package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// Version response structure
type VersionResponse struct {
	Success bool   `json:"success"`
	Data    Data   `json:"data"`
	Message string `json:"message"`
}

type Data struct {
	Version     string `json:"version"`
	Environment string `json:"environment"`
	Timestamp   string `json:"timestamp"`
}

func main() {
	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)
	
	// Create Gin router
	r := gin.Default()

	// Setup CORS middleware
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// Add logging middleware
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// API routes group
	api := r.Group("/api")
	{
		// Version endpoint
		api.GET("/version", getVersion)
		
		// Health check endpoint
		api.GET("/health", getHealth)
	}

	// Get port from environment or default to 3000
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Starting ClassSwift API server on port %s", port)
	
	// Start server
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// getVersion handles GET /api/version
func getVersion(c *gin.Context) {
	response := VersionResponse{
		Success: true,
		Data: Data{
			Version:     "1.0.0",
			Environment: getEnvironment(),
			Timestamp:   time.Now().UTC().Format(time.RFC3339),
		},
		Message: "ClassSwift Teacher Dashboard API",
	}
	
	c.JSON(http.StatusOK, response)
}

// getHealth handles GET /api/health
func getHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"status": "healthy",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		},
		"message": "Service is running",
	})
}

// getEnvironment returns the current environment
func getEnvironment() string {
	env := os.Getenv("GIN_MODE")
	if env == "" {
		env = "development"
	}
	return env
}