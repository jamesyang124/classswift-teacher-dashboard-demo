package model

import "time"

// Student represents a student (independent of classes).
type Student struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// StudentPreferredSeat represents the many-to-many relationship between students and classes with preferred seats.
type StudentPreferredSeat struct {
	ID                  uint      `json:"id" gorm:"primaryKey"`
	StudentID           uint      `json:"studentId" gorm:"not null;index"`
	ClassID             string    `json:"classId" gorm:"not null;index"`
	PreferredSeatNumber int       `json:"preferredSeatNumber" gorm:"not null"`
	CreatedAt           time.Time `json:"createdAt" gorm:"default:CURRENT_TIMESTAMP"`
	UpdatedAt           time.Time `json:"updatedAt"`
	
	// Foreign key relationships
	Student Student `json:"student" gorm:"foreignKey:StudentID"`
	Class   Class   `json:"class" gorm:"foreignKey:ClassID"`
}

// TableName sets the table name for the StudentPreferredSeat model
func (StudentPreferredSeat) TableName() string {
	return "student_preferred_seats"
}

// StudentWithClassPreferredSeat combines student info with their preferred seat details for a specific class.
type StudentWithClassPreferredSeat struct {
	ID                  uint      `json:"id"`
	Name                string    `json:"name"`
	ClassID             string    `json:"classId"`
	PreferredSeatNumber int       `json:"preferredSeatNumber"`
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time `json:"updatedAt"`
}

