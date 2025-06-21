package logger

import (
	"go.uber.org/zap"
)

// Logger is a wrapper around zap.SugaredLogger for consistent logging
var Logger *zap.SugaredLogger

// Init initializes the global zap logger (SugaredLogger)
func Init() {
	if Logger != nil {
		return
	}
	l, err := zap.NewProduction()
	if err != nil {
		panic("failed to initialize zap logger: " + err.Error())
	}
	Logger = l.Sugar()
}

// Sync flushes any buffered log entries
func Sync() {
	if Logger != nil {
		Logger.Sync()
	}
}

// Info logs a message at InfoLevel.
func Info(args ...interface{}) {
	if Logger != nil {
		Logger.Info(args...)
	}
}

// Infof logs a formatted message at InfoLevel.
func Infof(format string, args ...interface{}) {
	if Logger != nil {
		Logger.Infof(format, args...)
	}
}

// Debug logs a message at DebugLevel.
func Debug(args ...interface{}) {
	if Logger != nil {
		Logger.Debug(args...)
	}
}

// Debugf logs a formatted message at DebugLevel.
func Debugf(format string, args ...interface{}) {
	if Logger != nil {
		Logger.Debugf(format, args...)
	}
}

// Warn logs a message at WarnLevel.
func Warn(args ...interface{}) {
	if Logger != nil {
		Logger.Warn(args...)
	}
}

// Warnf logs a formatted message at WarnLevel.
func Warnf(format string, args ...interface{}) {
	if Logger != nil {
		Logger.Warnf(format, args...)
	}
}

// Error logs a message at ErrorLevel.
func Error(args ...interface{}) {
	if Logger != nil {
		Logger.Error(args...)
	}
}

// Errorf logs a formatted message at ErrorLevel.
func Errorf(format string, args ...interface{}) {
	if Logger != nil {
		Logger.Errorf(format, args...)
	}
}
