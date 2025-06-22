package model

import "time"

// APIResponse is the standard API response model.
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
	Errors  []string    `json:"errors,omitempty"`
}

// WebSocketMessage represents a message sent over WebSocket.
type WebSocketMessage struct {
	Type      string      `json:"type"`
	ClassID   string      `json:"classId"`
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
}

// ClassResponse is a response struct for class details with join link.
type ClassResponse struct {
	Class    Class  `json:"class"`
	JoinLink string `json:"joinLink"`
}

// QRCodeResponse is a response struct for QR code data.
type QRCodeResponse struct {
	Success bool       `json:"success"`
	Data    QRCodeData `json:"data"`
	Message string     `json:"message"`
}

// StudentsResponse is a response struct for class students.
type StudentsResponse struct {
	Students        []Student `json:"students"`
	TotalCapacity   int       `json:"totalCapacity"`
	EnrolledCount   int       `json:"enrolledCount"`
	AvailableSlots  int       `json:"availableSlots"`
}
