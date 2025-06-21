package model

import "time"

// Student represents a student in a class.
type Student struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	Name       string    `json:"name" gorm:"not null"`
	ClassID    *string   `json:"classId" gorm:"index"`
	SeatNumber *int      `json:"seatNumber"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}
