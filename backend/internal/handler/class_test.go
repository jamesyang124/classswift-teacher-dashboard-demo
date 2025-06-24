package handler_test

import (
	"classswift-backend/config"
	"classswift-backend/internal/handler"
	"classswift-backend/pkg/database"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/gin-gonic/gin"
)

func setupMockDB(t *testing.T) *gorm.DB {
	db, _, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock database: %v", err)
	}
	gormDB, err := gorm.Open(postgres.New(postgres.Config{Conn: db}), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open gorm DB: %v", err)
	}
	return gormDB
}


func TestGetClassQRCode_NotFound(t *testing.T) {
	config.Init()
	database.SetDB(setupMockDB(t))
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = append(c.Params, gin.Param{Key: "classId", Value: "nonexistent"})

	handler.GetClassQRCode(c)

	if w.Code != http.StatusNotFound && w.Code != http.StatusInternalServerError {
		t.Errorf("Expected 404 or 500 for missing class, got %d", w.Code)
	}
}

func TestHandleStudentJoin_NotFound(t *testing.T) {
	config.Init()
	database.SetDB(setupMockDB(t))
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Params = append(c.Params, gin.Param{Key: "classId", Value: "nonexistent"})
	c.Request, _ = http.NewRequest("GET", "/classes/nonexistent/join", nil)
	c.Request.Header.Set("X-Student-Name", "TestStudent")

	handler.HandleStudentJoin(c)

	if w.Code != http.StatusBadRequest && w.Code != http.StatusInternalServerError {
		t.Errorf("Expected 400 or 500 for missing class, got %d", w.Code)
	}
}
