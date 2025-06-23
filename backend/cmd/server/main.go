package main

import (
	"classswift-backend/config"
	"classswift-backend/internal/handler"
	"classswift-backend/internal/middleware"
	"classswift-backend/internal/service"
	"classswift-backend/pkg/database"
	"classswift-backend/pkg/logger"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	v1 "classswift-backend/api/v1"
)

// Global database connection
var db *gorm.DB

func main() {
	// Initialize config
	config.Init()
	// Initialize logger
	logger.Init()
	defer logger.Sync()

	// Set Gin mode from config
	gin.SetMode(config.GinMode())

	// Initialize database using pkg/database and config
	var err error
	db, err = database.Init()
	if err != nil {
		logger.Errorf("Failed to initialize database: %v", err)
		panic(err)
	}

	// Initialize WebSocket hub
	service.InitWebSocketHub()

	// Create Gin router
	r := gin.Default()

	// Use CORS middleware from internal/middleware
	r.Use(middleware.CORSMiddleware())

	// Add logging middleware
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Health check route
	r.GET("/health", handler.GetHealth)

	// Class routes
	v1.RegisterClassRoutes(
		r.Group("/api/v1"),
		handler.GetClasses,
		handler.GetClass,
		handler.GetClassStudents,
		handler.GetClassQRCode,
		handler.HandleStudentJoin,
		handler.HandleWebSocket,
		handler.ClearSeatForClassByPublicID,
	)

	logger.Infof("Starting ClassSwift API server on port %s", config.Port())

	// Start server
	if err := r.Run(":" + config.Port()); err != nil {
		logger.Errorf("Failed to start server: %v", err)
		panic(err)
	}
}
