package v1_test

import (
	v1 "classswift-backend/api/v1"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func dummyHandler(c *gin.Context) {
	c.String(200, "ok")
}

func TestRegisterClassRoutes(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	v1.RegisterClassRoutes(r.Group("/api/v1"), dummyHandler, dummyHandler, dummyHandler, dummyHandler, dummyHandler)

	endpoints := []string{
		"/api/v1/classes",
		"/api/v1/classes/abc",
		"/api/v1/classes/abc/qr",
		"/api/v1/classes/abc/join",
		"/api/v1/classes/abc/ws",
	}

	for _, ep := range endpoints {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", ep, nil)
		req.Header.Set("Origin", "http://localhost") // Ensure CORS header is set if middleware is present
		r.ServeHTTP(w, req)
		if w.Code != 200 || w.Body.String() != "ok" {
			t.Errorf("Route %s did not return expected response", ep)
		}
	}
}

func TestRegisterHealthRoutes(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	v1.RegisterHealthRoutes(r.Group("/api/v1"), dummyHandler)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/v1/health", nil)
	r.ServeHTTP(w, req)
	if w.Code != 200 || w.Body.String() != "ok" {
		t.Error("Health route did not return expected response")
	}
}
