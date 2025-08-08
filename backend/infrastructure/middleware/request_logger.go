package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/phuhao00/cmdb/backend/infrastructure/logging"
	"go.uber.org/zap"
)

// RequestLogger is a Gin middleware that logs each HTTP request in structured form.
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		rawQuery := c.Request.URL.RawQuery
		method := c.Request.Method
		ua := c.Request.UserAgent()
		clientIP := c.ClientIP()

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()
		errMsg := c.Errors.ByType(gin.ErrorTypePrivate).String()

		logging.Logger.Info("http_request",
			zap.Int("status", status),
			zap.String("method", method),
			zap.String("path", path),
			zap.String("query", rawQuery),
			zap.String("client_ip", clientIP),
			zap.String("user_agent", ua),
			zap.Duration("latency", latency),
			zap.Int64("latency_ms", latency.Milliseconds()),
			zap.String("error", errMsg),
		)
	}
}
