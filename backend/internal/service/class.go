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

// JoinStudentToClass finds or creates a student and returns their preferred seat info for the class.
// No seat assignment logic - just fetch/insert student and get their preferred seat if exists.
func JoinStudentToClass(db *gorm.DB, studentName string, classID string) (*model.Student, *model.StudentPreferredSeat, error) {
	var student *model.Student
	var preferredSeat *model.StudentPreferredSeat

	err := db.Transaction(func(tx *gorm.DB) error {
		// Find or create the student
		var err error
		student, err = GetStudentByName(tx, studentName)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				// Create new student
				student = &model.Student{
					Name: studentName,
				}
				if err := CreateStudent(tx, student); err != nil {
					return err
				}
			} else {
				return err
			}
		}

		// Check if student has a preferred seat in this class
		preferredSeat, err = GetPreferredSeatByStudentAndClass(tx, student.ID, classID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		// If err is ErrRecordNotFound, preferredSeat will be nil (no preferred seat)

		return nil
	})

	return student, preferredSeat, err
}
