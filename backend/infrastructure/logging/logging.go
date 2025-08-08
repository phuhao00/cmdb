package logging

import (
	"os"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Logger is the global structured logger instance
var Logger *zap.Logger

// Init initializes the global zap logger. It chooses production or development
// configuration based on the GIN_MODE env ("release" => production).
func Init() error {
	mode := os.Getenv("GIN_MODE")
	var cfg zap.Config
	if mode == "release" { // production style
		cfg = zap.NewProductionConfig()
	} else {
		cfg = zap.NewDevelopmentConfig()
	}

	// Unify time format (RFC3339)
	cfg.EncoderConfig.EncodeTime = func(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
		enc.AppendString(t.Format(time.RFC3339))
	}

	// Lower default level if specified LOG_LEVEL
	if lvl := os.Getenv("LOG_LEVEL"); lvl != "" {
		if err := cfg.Level.UnmarshalText([]byte(lvl)); err == nil {
			// only update if valid
		}
	}

	l, err := cfg.Build(zap.AddCaller())
	if err != nil {
		return err
	}
	Logger = l
	return nil
}

// Sync flushes any buffered log entries.
func Sync() {
	if Logger != nil {
		_ = Logger.Sync()
	}
}

// With returns a child logger with additional fields.
func With(fields ...zap.Field) *zap.Logger {
	if Logger == nil {
		// fallback to a no-op logger to avoid panics
		return zap.NewNop()
	}
	return Logger.With(fields...)
}
