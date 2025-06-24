package integration

import (
	"classswift-backend/config"
	"classswift-backend/internal/handler"
	"classswift-backend/pkg/database"
	"net/http"
	"net/http/httptest"
	"os"
	"sync"
	"testing"

	"github.com/gin-gonic/gin"
)

var once sync.Once

// SetupTestServer returns a Gin engine with routes for integration tests.
func SetupTestServer() *gin.Engine {

	once.Do(func() {
		os.Setenv("PORT", "4001") // avoid port conflict
		// Use the Docker Compose test DB connection string
		os.Setenv("DATABASE_URL", "postgres://classswift:password@localhost:5433/classswift_test?sslmode=disable")
		config.Init()
		db, err := database.Init()
		if err != nil {
			panic("Failed to initialize database: " + err.Error())
		}
		database.SetDB(db)
	})

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/health", handler.GetHealth)
	r.GET("/classes/:classId", handler.GetClass)
	r.GET("/classes/:classId/qr", handler.GetClassQRCode)
	r.GET("/classes/:classId/join", handler.HandleStudentJoin)
	return r
}

// TestMainIntegration starts the server and checks health endpoint with real config.
func TestMainIntegration(t *testing.T) {
	t.Skip("Integration test requires database connection")
	SetupTestServer()
	// For now, just check config loads and port is set
	if config.Port() != "4001" {
		t.Fatalf("Expected port 4001, got %s", config.Port())
	}
}

func TestHealthEndpointIntegration(t *testing.T) {
	t.Skip("Integration test requires database connection")
	r := SetupTestServer()

	req, _ := http.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", w.Code)
	}
}

func TestGetClassIntegration(t *testing.T) {
	t.Skip("Integration test requires database connection")
	r := SetupTestServer()

	req, _ := http.NewRequest("GET", "/classes/X58E9647", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", w.Code)
	}
}


func TestGetClassQRCodeIntegration(t *testing.T) {
	t.Skip("Integration test requires database connection")
	r := SetupTestServer()

	req, _ := http.NewRequest("GET", "/classes/X58E9647/qr", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", w.Code)
	}
}

func TestHandleStudentJoinIntegration(t *testing.T) {
	t.Skip("Integration test requires database connection")
	r := SetupTestServer()

	req, _ := http.NewRequest("GET", "/classes/X58E9647/join", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusFound && w.Code != http.StatusOK {
		t.Fatalf("Expected 302 or 200, got %d", w.Code)
	}
}
