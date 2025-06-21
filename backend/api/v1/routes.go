package v1

import "github.com/gin-gonic/gin"

// RegisterClassRoutes registers class-related endpoints for the API.
func RegisterClassRoutes(rg *gin.RouterGroup, getClass gin.HandlerFunc, getClassStudents gin.HandlerFunc, getClassQRCode gin.HandlerFunc, handleStudentJoin gin.HandlerFunc) {
	rg.GET("/classes/:classId", getClass)
	rg.GET("/classes/:classId/students", getClassStudents)
	rg.GET("/classes/:classId/qr", getClassQRCode)
	rg.GET("/classes/:classId/join", handleStudentJoin)
}

// RegisterHealthRoutes registers health check endpoint for the API.
func RegisterHealthRoutes(rg *gin.RouterGroup, getHealth gin.HandlerFunc) {
	rg.GET("/health", getHealth)
}
