package handler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"classswift-backend/config"
	"classswift-backend/internal/model"
	"classswift-backend/internal/service"
	"classswift-backend/pkg/database"
	"classswift-backend/pkg/logger"
)

// GetClass handles GET /api/v1/classes/:classId
func GetClass(c *gin.Context) {
	db := database.GetDB()
	classID := c.Param("classId")

	class, err := service.GetClassByPublicID(db, classID)
	if err != nil {
		c.JSON(http.StatusNotFound, model.APIResponse{
			Success: false,
			Message: "Class not found",
			Errors:  []string{"Class with the specified ID does not exist"},
		})
		return
	}

	response := model.ClassResponse{
		Class:    *class,
		JoinLink: fmt.Sprintf("%s/api/v1/classes/%s/join", config.BaseURL(), class.PublicID),
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Data:    response,
		Message: "Class information retrieved successfully",
	})
}

// GetClassStudents handles GET /api/v1/classes/:classId/students
func GetClassStudents(c *gin.Context) {
	db := database.GetDB()
	classID := c.Param("classId")

	class, err := service.GetClassByPublicID(db, classID)
	if err != nil {
		c.JSON(http.StatusNotFound, model.APIResponse{
			Success: false,
			Message: "Class not found",
			Errors:  []string{"Class with the specified ID does not exist"},
		})
		return
	}

	students, err := service.GetClassStudents(db, class.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Message: "Failed to retrieve students",
			Errors:  []string{err.Error()},
		})
		return
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Data:    students,
		Message: "Students retrieved successfully",
	})
}

// GetClassQRCode handles GET /api/v1/classes/:classId/qr
func GetClassQRCode(c *gin.Context) {
	db := database.GetDB()
	classID := c.Param("classId")

	class, err := service.GetClassByPublicID(db, classID)
	if err != nil {
		c.JSON(http.StatusNotFound, model.APIResponse{
			Success: false,
			Message: "Class not found",
			Errors:  []string{"Class with the specified ID does not exist"},
		})
		return
	}

	joinURL, base64QR, err := service.GenerateClassQRCode(class.PublicID)
	if err != nil {
		logger.Errorf("Failed to generate QR code: %v", err)
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Message: "Failed to generate QR code",
			Errors:  []string{err.Error()},
		})
		return
	}

	response := model.QRCodeResponse{
		Success: true,
		Data: model.QRCodeData{
			QRCodeBase64: "data:image/png;base64," + base64QR,
			JoinLink:     joinURL,
			ClassID:      class.PublicID,
		},
		Message: "QR code generated successfully",
	}

	c.JSON(http.StatusOK, response)
}

// HandleStudentJoin handles GET /api/v1/classes/:classId/join
func HandleStudentJoin(c *gin.Context) {
	db := database.GetDB()
	classID := c.Param("classId")

	class, err := service.GetClassByPublicID(db, classID)
	if err != nil {
		c.JSON(http.StatusNotFound, model.APIResponse{
			Success: false,
			Message: "Class not found",
			Errors:  []string{"Class with the specified ID does not exist"},
		})
		return
	}

	if !class.IsActive {
		c.JSON(http.StatusForbidden, model.APIResponse{
			Success: false,
			Message: "Class is not accepting students",
			Errors:  []string{"Class is currently inactive"},
		})
		return
	}

	studentName := c.GetHeader("X-Student-Name")
	if studentName == "" {
		studentName = "Guest"
	}

	// Move join logic to service
	joined, err := service.JoinStudentToClass(db, class, studentName)
	if joined {
		c.Redirect(http.StatusFound, config.ClassRedirectionBaseURL())
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Message: "Failed to add student to class",
			Errors:  []string{err.Error()},
		})
		return
	}

	c.Redirect(http.StatusFound, config.ClassRedirectionBaseURL())
}
