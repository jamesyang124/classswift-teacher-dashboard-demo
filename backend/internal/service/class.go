package service

import (
	"classswift-backend/internal/model"

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

// GetClassStudents fetches all students for a class.
func GetClassStudents(db *gorm.DB, classID string) ([]model.Student, error) {
	var students []model.Student
	result := db.Where("class_id = ?", classID).Find(&students)
	if result.Error != nil {
		return nil, result.Error
	}
	return students, nil
}

// CreateStudent adds a new student to a class.
func CreateStudent(db *gorm.DB, student *model.Student) error {
	return db.Create(student).Error
}

// GetStudentByNameAndClass fetches a student by name and class ID.
func GetStudentByNameAndClass(db *gorm.DB, name string, classID string) (*model.Student, error) {
	var student model.Student
	result := db.Where("name = ? AND class_id = ?", name, classID).First(&student)
	if result.Error != nil {
		return nil, result.Error
	}
	return &student, nil
}

// JoinStudentToClass adds a student to a class or returns true if already joined.
// Returns (alreadyJoined, error)
func JoinStudentToClass(db *gorm.DB, class *model.Class, studentName string) (bool, error) {
	existingStudent, err := GetStudentByNameAndClass(db, studentName, class.ID)
	if err == nil && existingStudent != nil {
		return true, nil // already joined
	}
	student := &model.Student{
		Name:    studentName,
		ClassID: &class.ID,
	}
	err = CreateStudent(db, student)
	if err != nil {
		return false, err
	}
	return false, nil
}
