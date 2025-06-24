package service

import (
	"classswift-backend/internal/model"
	"errors"

	"gorm.io/gorm"
)

// GetClassByPublicID fetches a class by its public ID.
func GetClassByPublicID(db *gorm.DB, publicID string) (*model.Class, error) {
	var class model.Class
	result := db.Where("public_id = ?", publicID).First(&class)
	if result.Error != nil {
		return nil, result.Error
	}
	return &class, nil
}

// GetClasses fetches all classes from the class table.
func GetClasses(db *gorm.DB) ([]model.Class, error) {
	var classes []model.Class
	result := db.Find(&classes)
	if result.Error != nil {
		return nil, result.Error
	}
	return classes, nil
}

// CreateStudent adds a new student (independent of classes).
func CreateStudent(db *gorm.DB, student *model.Student) error {
	return db.Create(student).Error
}

// GetStudentByName fetches a student by name only.
func GetStudentByName(db *gorm.DB, name string) (*model.Student, error) {
	var student model.Student
	result := db.Where("name = ?", name).First(&student)
	if result.Error != nil {
		return nil, result.Error
	}
	return &student, nil
}

// GetPreferredSeatByStudentAndClass fetches a preferred seat by student ID and class ID.
func GetPreferredSeatByStudentAndClass(db *gorm.DB, studentID uint, classID string) (*model.StudentPreferredSeat, error) {
	var preferredSeat model.StudentPreferredSeat
	result := db.Where("student_id = ? AND class_id = ?", studentID, classID).First(&preferredSeat)
	if result.Error != nil {
		return nil, result.Error
	}
	return &preferredSeat, nil
}

// FindStudentPreferredSeat looks up a student by name and returns their preferred seat info for the class.
// If the student is not registered, returns (nil, nil, nil) to indicate a guest. Does not create a student.
func FindStudentPreferredSeat(db *gorm.DB, studentName string, classID string) (*model.Student, *model.StudentPreferredSeat, error) {
	var student *model.Student
	var preferredSeat *model.StudentPreferredSeat

	err := db.Transaction(func(tx *gorm.DB) error {
		// Try to find the student
		var err error
		student, err = GetStudentByName(tx, studentName)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				// Student not registered: treat as guest (do not create student)
				student = nil
				preferredSeat = nil
				return nil
			}
			return err
		}

		// Fetch the class to get its internal ID
		class, err := GetClassByPublicID(tx, classID)
		if err != nil {
			return err
		}

		// Check if student has a preferred seat in this class (using internal class ID)
		preferredSeat, err = GetPreferredSeatByStudentAndClass(tx, student.ID, class.ID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		// If err is ErrRecordNotFound, preferredSeat will be nil (no preferred seat)

		return nil
	})

	return student, preferredSeat, err
}
