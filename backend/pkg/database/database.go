package database

import (
	"classswift-backend/config"
	"classswift-backend/internal/model"
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

	// Auto migrate the schema
	err = db.AutoMigrate(&model.Class{}, &model.Student{})
	if err != nil {
		return nil, err
	}

	// Insert sample data if database is empty
	var classCount int64
	db.Model(&model.Class{}).Count(&classCount)
	if classCount == 0 {
		insertSampleData(db)
	}

	SetDB(db) // Set the global DB instance

	logger.Info("Database initialized successfully")
	return db, nil
}

// insertSampleData inserts initial sample data
func insertSampleData(db *gorm.DB) {
	// Create sample class
	class := model.Class{
		ID:            "class-1",
		PublicID:      "X58E9647",
		Name:          "302 Science",
		StudentCount:  0,
		TotalCapacity: 30,
		IsActive:      true,
	}
	db.Create(&class)

	// Create sample students
	students := []model.Student{
		{Name: "Philip", ClassID: &class.ID, SeatNumber: intPtr(1)},
		{Name: "Darrell", ClassID: &class.ID, SeatNumber: intPtr(2)},
		{Name: "Cody", ClassID: &class.ID, SeatNumber: intPtr(3)},
		{Name: "Alice", ClassID: &class.ID, SeatNumber: nil}, // Not seated
	}

	for _, student := range students {
		db.Create(&student)
	}

	logger.Info("Sample data inserted")
}

// Helper function to create int pointer
func intPtr(i int) *int {
	return &i
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
