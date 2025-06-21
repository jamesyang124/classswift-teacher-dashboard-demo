package model

import "time"

// Class represents a classroom.
type Class struct {
	ID            string    `json:"id" gorm:"primaryKey"`
	PublicID      string    `json:"publicId" gorm:"uniqueIndex;not null"`
	Name          string    `json:"name" gorm:"not null"`
	StudentCount  int       `json:"studentCount" gorm:"default:0"`
	TotalCapacity int       `json:"totalCapacity" gorm:"default:30"`
	IsActive      bool      `json:"isActive" gorm:"default:true"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}
