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

func TestFindStudentPreferredSeat_Guest(t *testing.T) {
	db, mock := setupMockDB(t)
	class := &model.Class{ID: "class-guest", PublicID: "PUBGUEST", Name: "Guest Class"}
	guestName := "GuestName"

	// Expect transaction begin
	mock.ExpectBegin()
	// Expect student lookup (not found) - this should return ErrRecordNotFound
	mock.ExpectQuery(`SELECT \* FROM "students" WHERE name = \$1 ORDER BY "students"."id" LIMIT (\$\d+|1)`).
		WithArgs(guestName, 1).
		WillReturnError(gorm.ErrRecordNotFound)
	// When student is not found, transaction should commit immediately (no class lookup needed)
	mock.ExpectCommit()

	student, seat, err := service.FindStudentPreferredSeat(db, guestName, class.PublicID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if student != nil || seat != nil {
		t.Errorf("expected nil student and seat for guest, got: %v, %v", student, seat)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %v", err)
	}
}
