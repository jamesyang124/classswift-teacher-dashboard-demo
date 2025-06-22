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

// JoinStudentToClass adds a student to a class with a specific seat number.
func JoinStudentToClass(db *gorm.DB, class *model.Class, studentName string, seatNumber int) error {
	// Check if seat is already occupied
	var existingSeatStudent model.Student
	result := db.Where("class_id = ? AND seat_number = ?", class.ID, seatNumber).First(&existingSeatStudent)
	if result.Error == nil {
		return gorm.ErrDuplicatedKey // Seat already occupied
	}
	
	// Check if student is already enrolled
	existingStudent, err := GetStudentByNameAndClass(db, studentName, class.ID)
	
	if err == nil && existingStudent != nil {
		// Student is already enrolled, update their seat number
		existingStudent.SeatNumber = &seatNumber
		if err := db.Save(existingStudent).Error; err != nil {
			return err
		}
		
		return nil // already enrolled, now seated
	}
	
	// Student is new, create them with the specified seat
	student := &model.Student{
		Name:       studentName,
		ClassID:    &class.ID,
		SeatNumber: &seatNumber,
	}
	
	err = CreateStudent(db, student)
	if err != nil {
		return err
	}
	
	return nil
}

