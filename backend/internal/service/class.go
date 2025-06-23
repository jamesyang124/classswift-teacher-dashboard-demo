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

// GetClasses fetches all classes from the class table.
func GetClasses(db *gorm.DB) ([]model.Class, error) {
	var classes []model.Class
	result := db.Find(&classes)
	if result.Error != nil {
		return nil, result.Error
	}
	return classes, nil
}

// ClearSeatForClassByPublicID finds a class by publicId and clears all enrolled students' seat numbers for that class, in a transaction.
func ClearSeatForClassByPublicID(db *gorm.DB, publicID string) (*model.Class, error) {
	var class model.Class
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("public_id = ?", publicID).First(&class).Error; err != nil {
			return err
		}
		if err := tx.Model(&model.Student{}).Where("class_id = ?", class.ID).Update("seat_number", nil).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	// No WebSocket broadcast here; handler is responsible
	return &class, nil
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

// JoinStudentToClass adds a student to a class with a specific seat number, using a transaction for atomicity.
func JoinStudentToClass(db *gorm.DB, class *model.Class, studentName string, seatNumber int) error {
	return db.Transaction(func(tx *gorm.DB) error {
		// Check if student is already enrolled first
		existingStudent, err := GetStudentByNameAndClass(tx, studentName, class.ID)

		// Check if seat is already occupied
		var existingSeatStudent model.Student
		result := tx.Where("class_id = ? AND seat_number = ?", class.ID, seatNumber).First(&existingSeatStudent)
		if result.Error == nil {
			// If the same student already has this seat, allow it (idempotent)
			if err == nil && existingStudent != nil && existingSeatStudent.ID == existingStudent.ID {
				return nil // Same student, same seat - allow redirect
			}
			return gorm.ErrDuplicatedKey // Seat occupied by different student
		}

		if err == nil && existingStudent != nil {
			// Student is already enrolled, update their seat number
			existingStudent.SeatNumber = &seatNumber
			if err := tx.Save(existingStudent).Error; err != nil {
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

		err = CreateStudent(tx, student)
		if err != nil {
			return err
		}

		return nil
	})
}
