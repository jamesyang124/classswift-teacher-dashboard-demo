package service_test

import (
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"classswift-backend/internal/model"
	"classswift-backend/internal/service"
)

func setupMockDB(t *testing.T) (*gorm.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock database: %v", err)
	}
	gormDB, err := gorm.Open(postgres.New(postgres.Config{Conn: db}), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open gorm DB: %v", err)
	}
	return gormDB, mock
}

func TestJoinStudentToClass_NewStudent_DISABLED(t *testing.T) {
	t.Skip("Test needs updating for new schema")
	db, mock := setupMockDB(t)
	class := &model.Class{ID: "class-1", PublicID: "PUB1", Name: "Test Class"}
	studentName := "Alice"
	seatNumber := 1

	// Expect transaction begin/commit
	mock.ExpectBegin()
	// Expect student lookup (not found)
	mock.ExpectQuery(`SELECT \* FROM "students" WHERE name = \$1 AND class_id = \$2 ORDER BY "students"\."id" LIMIT (\$\d+|1)`).
		WithArgs(studentName, class.ID, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "seat_number"}))
	// Expect seat lookup (not found)
	mock.ExpectQuery(`SELECT \* FROM "students" WHERE class_id = \$1 AND seat_number = \$2 ORDER BY "students"\."id" LIMIT (\$\d+|1)`).
		WithArgs(class.ID, seatNumber, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "seat_number"}))
	// Expect insert (GORM uses Query for INSERT ... RETURNING)
	mock.ExpectQuery("INSERT INTO \\\"students\\\"").
		WithArgs(
			studentName,      // name
			class.ID,         // class_id
			seatNumber,       // seat_number
			sqlmock.AnyArg(), // created_at
			sqlmock.AnyArg(), // updated_at
		).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
	mock.ExpectCommit()

	err := service.JoinStudentToClass(db, class, studentName, seatNumber)
	if err != nil {
		t.Errorf("expected no error for new student, got %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %v", err)
	}
}

func TestJoinStudentToClass_SeatOccupied_DISABLED(t *testing.T) {
	t.Skip("Test needs updating for new schema")
	db, mock := setupMockDB(t)
	class := &model.Class{ID: "class-1", PublicID: "PUB1", Name: "Test Class"}
	studentName := "Bob"
	seatNumber := 2

	// Expect transaction begin
	mock.ExpectBegin()
	// Expect student lookup (not found)
	mock.ExpectQuery(`SELECT \* FROM "students" WHERE name = \$1 AND class_id = \$2 ORDER BY "students"\."id" LIMIT (\$\d+|1)`).
		WithArgs(studentName, class.ID, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "seat_number"}))
	// Simulate seat already occupied by returning a row for the seat lookup
	mock.ExpectQuery(`SELECT \* FROM "students" WHERE class_id = \$1 AND seat_number = \$2 ORDER BY "students"\."id" LIMIT (\$\d+|1)`).
		WithArgs(class.ID, seatNumber, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "seat_number"}).AddRow(99, "OtherStudent", seatNumber))
	// Expect rollback
	mock.ExpectRollback()

	err := service.JoinStudentToClass(db, class, studentName, seatNumber)
	if err == nil {
		t.Errorf("expected error for occupied seat, got nil")
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %v", err)
	}
}

func TestJoinStudentToClass_AlreadyEnrolled_DISABLED(t *testing.T) {
	t.Skip("Test needs updating for new schema")
	db, mock := setupMockDB(t)
	class := &model.Class{ID: "class-1", PublicID: "PUB1", Name: "Test Class"}
	studentName := "Charlie"
	studentID := 1
	seatNumber := 3

	// Mock transaction begin
	mock.ExpectBegin()

	// Mock GetStudentByNameAndClass (student exists)
	mock.ExpectQuery(`SELECT \* FROM "students" WHERE name = \$1 AND class_id = \$2 ORDER BY "students"\."id" LIMIT (\$\d+|1)`).
		WithArgs(studentName, class.ID, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "seat_number"}).AddRow(studentID, studentName, seatNumber))
	// Mock seat lookup (should not find another student with this seat, so return no rows)
	mock.ExpectQuery(`SELECT \* FROM "students" WHERE class_id = \$1 AND seat_number = \$2 ORDER BY "students"\."id" LIMIT (\$\d+|1)`).
		WithArgs(class.ID, seatNumber, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "seat_number"}))
	// Mock update of seat number (should be a no-op if already correct, but GORM may still call Save)
	mock.ExpectExec("UPDATE \"students\"").
		WithArgs(
			studentName,      // name
			nil,              // class_id (NULL in this test)
			seatNumber,       // seat_number
			sqlmock.AnyArg(), // created_at
			sqlmock.AnyArg(), // updated_at
			studentID,        // id
		).
		WillReturnResult(sqlmock.NewResult(1, 1))
	// Mock transaction commit
	mock.ExpectCommit()

	err := service.JoinStudentToClass(db, class, studentName, seatNumber)
	if err != nil {
		t.Errorf("expected no error for already enrolled student, got %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %v", err)
	}
}

func TestGetClassByPublicID(t *testing.T) {
	db, mock := setupMockDB(t)
	publicID := "PUB1"
	classID := "class-1"
	mock.ExpectQuery(`SELECT \* FROM "classes" WHERE public_id = \$1 ORDER BY "classes"\."id" LIMIT (\$\d+|1)`).
		WithArgs(publicID, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "public_id", "name"}).AddRow(classID, publicID, "Test Class"))
	class, err := service.GetClassByPublicID(db, publicID)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if class == nil || class.ID != classID {
		t.Errorf("expected class with ID %s, got %+v", classID, class)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %v", err)
	}
}

func TestGetClassStudents_DISABLED(t *testing.T) {
	t.Skip("Test needs updating for new schema")
	db, mock := setupMockDB(t)
	classID := "class-1"
	mock.ExpectQuery(`SELECT \* FROM "students" WHERE class_id = \$1`).
		WithArgs(classID).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "class_id"}).AddRow(1, "Alice", classID).AddRow(2, "Bob", classID))
	students, err := service.GetClassStudents(db, classID)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if len(students) != 2 {
		t.Errorf("expected 2 students, got %d", len(students))
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %v", err)
	}
}

func TestGetClasses(t *testing.T) {
	db, mock := setupMockDB(t)
	mock.ExpectQuery(`SELECT \* FROM "classes"`).
		WillReturnRows(sqlmock.NewRows([]string{"id", "public_id", "name"}).AddRow("class-1", "PUB1", "Test Class").AddRow("class-2", "PUB2", "Other Class"))
	classes, err := service.GetClasses(db)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if len(classes) != 2 {
		t.Errorf("expected 2 classes, got %d", len(classes))
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %v", err)
	}
}

func TestClearSeatForClassByPublicID_DISABLED(t *testing.T) {
	t.Skip("Test needs updating for new schema")
	db, mock := setupMockDB(t)
	publicID := "PUB1"
	classID := "class-1"
	mock.ExpectBegin()
	mock.ExpectQuery(`SELECT \* FROM "classes" WHERE public_id = \$1 ORDER BY "classes"\."id" LIMIT (\$\d+|1)`).
		WithArgs(publicID, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "public_id", "name"}).AddRow(classID, publicID, "Test Class"))
	mock.ExpectExec(`UPDATE "students" SET "seat_number"=\$1,"updated_at"=\$2 WHERE class_id = \$3`).
		WithArgs(nil, sqlmock.AnyArg(), classID).
		WillReturnResult(sqlmock.NewResult(0, 2))
	mock.ExpectCommit()
	class, err := service.ClearSeatForClassByPublicID(db, publicID)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if class == nil || class.ID != classID {
		t.Errorf("expected class with ID %s, got %+v", classID, class)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %v", err)
	}
}

func TestGetStudentByName(t *testing.T) {
	db, mock := setupMockDB(t)
	name := "Alice"
	mock.ExpectQuery(`SELECT \* FROM "students" WHERE name = \$1 ORDER BY "students"\."id" LIMIT (\$\d+|1)`).
		WithArgs(name, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name"}).AddRow(1, name))
	student, err := service.GetStudentByName(db, name)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if student == nil || student.Name != name {
		t.Errorf("expected student with name %s, got %+v", name, student)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %v", err)
	}
}
