package model

import "time"

// Student represents a student (independent of classes).
type Student struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// ClassEnrollment represents the many-to-many relationship between students and classes.
type ClassEnrollment struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	StudentID  uint      `json:"studentId" gorm:"not null;index"`
	ClassID    string    `json:"classId" gorm:"not null;index"`
	SeatNumber *int      `json:"seatNumber"`
	EnrolledAt time.Time `json:"enrolledAt" gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt  time.Time `json:"updatedAt"`
	
	// Foreign key relationships
	Student Student `json:"student" gorm:"foreignKey:StudentID"`
	Class   Class   `json:"class" gorm:"foreignKey:ClassID"`
}

// StudentWithEnrollment combines student info with their enrollment details for a specific class.
type StudentWithEnrollment struct {
	ID         uint      `json:"id"`
	Name       string    `json:"name"`
	ClassID    string    `json:"classId"`
	SeatNumber *int      `json:"seatNumber"`
	EnrolledAt time.Time `json:"enrolledAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// StudentResponse represents student data returned to the frontend.
type StudentResponse struct {
	ID         uint   `json:"id"`
	Name       string `json:"name"`
	SeatNumber *int   `json:"seatNumber"`
	Score      int    `json:"score"`
	IsGuest    bool   `json:"isGuest"`
}
