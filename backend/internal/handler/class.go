package handler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

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

	enrolledCount := len(students)
	availableSlots := class.TotalCapacity - enrolledCount

	response := model.StudentsResponse{
		Students:       students,
		TotalCapacity:  class.TotalCapacity,
		EnrolledCount:  enrolledCount,
		AvailableSlots: availableSlots,
	}

	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Data:    response,
		Message: "Students retrieved successfully",
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

// ClearSeatForClassByPublicID handles POST /api/v1/classes/:classId/clear-seats
func ClearSeatForClassByPublicID(c *gin.Context) {
	db := database.GetDB()
	classID := c.Param("classId")
	class, err := service.ClearSeatForClassByPublicID(db, classID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Message: "Failed to clear seats",
			Errors:  []string{err.Error()},
		})
		return
	}
	c.JSON(http.StatusOK, model.APIResponse{
		Success: true,
		Data:    class,
		Message: "Seats cleared successfully",
	})
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

	// Get seat number from query parameter
	seatNumberStr := c.Query("seat")
	if seatNumberStr == "" {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Seat number is required",
			Errors:  []string{"Missing 'seat' query parameter"},
		})
		return
	}

	seatNumber := 0
	if _, err := fmt.Sscanf(seatNumberStr, "%d", &seatNumber); err != nil || seatNumber <= 0 {
		c.JSON(http.StatusBadRequest, model.APIResponse{
			Success: false,
			Message: "Invalid seat number",
			Errors:  []string{"Seat number must be a positive integer"},
		})
		return
	}

	// Move join logic to service
	err = service.JoinStudentToClass(db, class, studentName, seatNumber)
	if err != nil {
		if err == gorm.ErrDuplicatedKey {
			c.JSON(http.StatusConflict, model.APIResponse{
				Success: false,
				Message: "Seat is already occupied",
				Errors:  []string{fmt.Sprintf("Seat %d is already taken", seatNumber)},
			})
			return
		}
		c.JSON(http.StatusInternalServerError, model.APIResponse{
			Success: false,
			Message: "Failed to add student to class",
			Errors:  []string{err.Error()},
		})
		return
	}

	// Broadcast class update after successful student join
	students, err := service.GetClassStudents(db, class.ID)
	if err == nil {
		enrolledCount := len(students)
		availableSlots := class.TotalCapacity - enrolledCount

		classUpdateData := map[string]interface{}{
			"totalCapacity":  class.TotalCapacity,
			"enrolledCount":  enrolledCount,
			"availableSlots": availableSlots,
			"students":       students, // Include the full students list
		}

		service.BroadcastClassUpdate(class.PublicID, "class_updated", classUpdateData)
	}

	c.Redirect(http.StatusFound, config.ClassRedirectionBaseURL())
}
