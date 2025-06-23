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

// GetClassStudents fetches all students enrolled in a class with their enrollment details.
func GetClassStudents(db *gorm.DB, classID string) ([]model.StudentWithEnrollment, error) {
	var students []model.StudentWithEnrollment
	
	result := db.Table("class_enrollments").
		Select("students.id, students.name, class_enrollments.class_id, class_enrollments.seat_number, class_enrollments.enrolled_at, class_enrollments.updated_at").
		Joins("INNER JOIN students ON students.id = class_enrollments.student_id").
		Where("class_enrollments.class_id = ?", classID).
		Find(&students)
	
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

// ClearSeatForClassByPublicID finds a class by publicId and clears all enrolled students' seat numbers for that class.
func ClearSeatForClassByPublicID(db *gorm.DB, publicID string) (*model.Class, error) {
	var class model.Class
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("public_id = ?", publicID).First(&class).Error; err != nil {
			return err
		}
		if err := tx.Model(&model.ClassEnrollment{}).Where("class_id = ?", class.ID).Update("seat_number", nil).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &class, nil
}

// CreateStudent adds a new student (independent of classes).
func CreateStudent(db *gorm.DB, student *model.Student) error {
	return db.Create(student).Error
}

// CreateClassEnrollment adds a new enrollment relationship.
func CreateClassEnrollment(db *gorm.DB, enrollment *model.ClassEnrollment) error {
	return db.Create(enrollment).Error
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

// GetEnrollmentByStudentAndClass fetches an enrollment by student ID and class ID.
func GetEnrollmentByStudentAndClass(db *gorm.DB, studentID uint, classID string) (*model.ClassEnrollment, error) {
	var enrollment model.ClassEnrollment
	result := db.Where("student_id = ? AND class_id = ?", studentID, classID).First(&enrollment)
	if result.Error != nil {
		return nil, result.Error
	}
	return &enrollment, nil
}

// GetEnrollmentBySeatAndClass fetches an enrollment by seat number and class ID.
func GetEnrollmentBySeatAndClass(db *gorm.DB, seatNumber int, classID string) (*model.ClassEnrollment, error) {
	var enrollment model.ClassEnrollment
	result := db.Where("seat_number = ? AND class_id = ?", seatNumber, classID).First(&enrollment)
	if result.Error != nil {
		return nil, result.Error
	}
	return &enrollment, nil
}

// JoinStudentToClass adds a student to a class with a specific seat number, using a transaction for atomicity.
func JoinStudentToClass(db *gorm.DB, class *model.Class, studentName string, seatNumber int) error {
	return db.Transaction(func(tx *gorm.DB) error {
		// Find or create the student
		student, err := GetStudentByName(tx, studentName)
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

		// Check if student is already enrolled in this class
		existingEnrollment, err := GetEnrollmentByStudentAndClass(tx, student.ID, class.ID)
		
		// Check if seat is already occupied by another student
		existingSeatEnrollment, seatErr := GetEnrollmentBySeatAndClass(tx, seatNumber, class.ID)
		if seatErr == nil {
			// Seat is occupied
			if existingEnrollment != nil && existingSeatEnrollment.StudentID == student.ID {
				// Same student, same seat - idempotent operation
				return nil
			}
			return gorm.ErrDuplicatedKey // Seat occupied by different student
		}

		if existingEnrollment != nil {
			// Student is already enrolled, update their seat number
			existingEnrollment.SeatNumber = &seatNumber
			if err := tx.Save(existingEnrollment).Error; err != nil {
				return err
			}
			return nil
		}

		// Create new enrollment
		enrollment := &model.ClassEnrollment{
			StudentID:  student.ID,
			ClassID:    class.ID,
			SeatNumber: &seatNumber,
		}

		return CreateClassEnrollment(tx, enrollment)
	})
}
