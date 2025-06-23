package database

import (
	"classswift-backend/config"
	"classswift-backend/pkg/logger"
	"sync"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

var (
	dbInstance *gorm.DB
	dbOnce     sync.Once
)

// Init initializes the database connection and runs migrations
func Init() (*gorm.DB, error) {
	url := config.DatabaseURL()

	db, err := gorm.Open(postgres.Open(url), &gorm.Config{
		Logger: gormlogger.Default.LogMode(gormlogger.Info),
	})
	if err != nil {
		return nil, err
	}

	// Note: AutoMigrate is disabled since we use SQL migrations with views and triggers
	// The database schema is managed by migrations in /migrations/ directory

	SetDB(db) // Set the global DB instance

	logger.Info("Database initialized successfully")
	return db, nil
}

// SetDB sets the global DB instance
func SetDB(db *gorm.DB) {
	dbOnce.Do(func() {
		dbInstance = db
	})
}

// GetDB returns the global DB instance
func GetDB() *gorm.DB {
	return dbInstance
}
