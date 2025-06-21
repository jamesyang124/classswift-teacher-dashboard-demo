package logger_test

import (
	"classswift-backend/pkg/logger"
	"testing"
)

func TestLoggerInitAndInfo(t *testing.T) {
	logger.Init()
	logger.Info("Logger initialized and info log works!")
}
