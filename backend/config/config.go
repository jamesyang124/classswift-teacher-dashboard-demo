package config

import (
	"os"
	"sync"

	"github.com/joho/godotenv"
)

// Config holds all application configuration loaded from environment variables or .env file.
// Fields are documented for clarity and maintainability.
type Config struct {
	// Port is the port the Gin server listens on (e.g., "3000").
	Port string
	// DatabaseURL is the connection string for the PostgreSQL database.
	DatabaseURL string
	// GinMode sets the Gin mode (e.g., "release", "debug").
	GinMode string
	// Host is the hostname or IP address the server binds to (e.g., "localhost").
	Host string
	// TLSMode determines if HTTPS is enabled (true) or HTTP (false).
	TLSMode bool
	// ClassRedirectionBaseURL is the base URL for class join redirection (e.g., for QR codes).
	ClassRedirectionBaseURL string
	// BaseURL is the computed full base URL (protocol + host + port) for the backend.
	BaseURL string
	// CORSOrigins is a comma-separated list of allowed CORS origins.
	CORSOrigins string
}

var (
	cfg     *Config
	cfgOnce sync.Once
)

// Init loads configuration from environment variables or .env file. Should be called once at startup.
func Init() {
	cfgOnce.Do(func() {
		_ = godotenv.Load() // load .env if present, ignore error if not

		// Convert TLS_MODE env to bool
		tlsMode := false
		if getEnv("TLS_MODE", "false") == "true" {
			tlsMode = true
		}

		proto := "http"
		if tlsMode {
			proto = "https"
		}
		host := getEnv("HOST", "localhost")
		port := getEnv("PORT", "3000")
		baseURL := proto + "://" + host + ":" + port

		cfg = &Config{
			Port:                    port,
			DatabaseURL:             getEnv("DATABASE_URL", ""),
			GinMode:                 getEnv("GIN_MODE", "release"),
			Host:                    host,
			TLSMode:                 tlsMode,
			ClassRedirectionBaseURL: getEnv("CLASS_REDIRECTION_BASE_URL", "https://www.classswift.viewsonic.io"),
			BaseURL:                 baseURL,
			CORSOrigins:             getEnv("CORS_ORIGINS", ""),
		}
	})
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

// BaseURL returns the computed full base URL (protocol + host + port) for the backend.
func BaseURL() string {
	if cfg == nil {
		panic("config.Init() must be called before config.BaseURL()")
	}
	return cfg.BaseURL
}

// ClassRedirectionBaseURL returns the base URL for class join redirection (e.g., for QR codes).
func ClassRedirectionBaseURL() string {
	if cfg == nil {
		panic("config.Init() must be called before config.ClassRedirectionBaseURL()")
	}
	return cfg.ClassRedirectionBaseURL
}

// GinMode returns the Gin mode (e.g., "release", "debug").
func GinMode() string {
	if cfg == nil {
		panic("config.Init() must be called before config.GinMode()")
	}
	return cfg.GinMode
}

// CORSOrigins returns the comma-separated list of allowed CORS origins.
func CORSOrigins() string {
	if cfg == nil {
		panic("config.Init() must be called before config.CORSOrigins()")
	}
	return cfg.CORSOrigins
}

// Port returns the port the Gin server listens on.
func Port() string {
	if cfg == nil {
		panic("config.Init() must be called before config.Port()")
	}
	return cfg.Port
}

// DatabaseURL returns the database connection string from the config/env only.
func DatabaseURL() string {
	if cfg == nil {
		panic("config.Init() must be called before config.DatabaseURL()")
	}
	return cfg.DatabaseURL
}
