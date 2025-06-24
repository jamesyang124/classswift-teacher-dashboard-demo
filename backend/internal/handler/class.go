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

// GetClasses handles GET /api/v1/classes
func GetClasses(c *gin.Context) {
	db := database.GetDB()
	classes, err := service.GetClasses(db)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Message: "Failed to retrieve classes",
			Errors:  []string{err.Error()},
		})
		return
	}
	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Data:    classes,
		Message: "Classes retrieved successfully",
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
	classPublicID := c.Param("classId")

	studentName := c.GetHeader("X-Student-Name")
	if studentName == "" {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Student name is required",
			Errors:  []string{"Missing 'X-Student-Name' header"},
		})
		return
	}

	// Find student and get their preferred seat
	student, preferredSeat, err := service.FindStudentPreferredSeat(db, studentName, classPublicID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Message: "Failed to process student join",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Prepare joining student data
	seatNumber := 0
	joiningStudentData := map[string]interface{}{
		"name":       studentName,
		"seatNumber": seatNumber,
	}
	if preferredSeat != nil {
		seatNumber = preferredSeat.PreferredSeatNumber
		joiningStudentData["seatNumber"] = seatNumber
	}
	// If student is registered, add id
	if student != nil {
		joiningStudentData["id"] = student.ID
	}

	// Broadcast WebSocket message
	classUpdateData := map[string]interface{}{
		"joiningStudent": joiningStudentData,
	}

	service.BroadcastClassUpdate(classPublicID, "class_updated", classUpdateData)

	c.Redirect(http.StatusFound, config.ClassRedirectionBaseURL())
}
