package api

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/phuhao00/cmdb/backend/application"
)

// AuditLogHandler handles audit log related HTTP requests
type AuditLogHandler struct {
	auditLogApp *application.AuditLogApplication
}

// NewAuditLogHandler creates a new audit log handler
func NewAuditLogHandler(auditLogApp *application.AuditLogApplication) *AuditLogHandler {
	return &AuditLogHandler{
		auditLogApp: auditLogApp,
	}
}

// RegisterRoutes registers audit log routes
func (h *AuditLogHandler) RegisterRoutes(router *gin.RouterGroup) {
	auditLogs := router.Group("/audit-logs")
	{
		auditLogs.GET("", h.SearchAuditLogs)
		auditLogs.GET("/user/:userId", h.GetUserActivityLogs)
		auditLogs.GET("/resource/:resourceType/:resourceId", h.GetResourceHistory)
		auditLogs.GET("/stats", h.GetAuditLogStats)
		auditLogs.DELETE("/cleanup", h.CleanupOldLogs)
	}
}

// SearchAuditLogs handles GET /api/v1/audit-logs
func (h *AuditLogHandler) SearchAuditLogs(c *gin.Context) {
	searchDTO := application.AuditLogSearchDTO{
		UserID:       c.Query("userId"),
		Username:     c.Query("username"),
		Action:       c.Query("action"),
		ResourceType: c.Query("resourceType"),
		ResourceID:   c.Query("resourceId"),
		IPAddress:    c.Query("ipAddress"),
		SortBy:       c.DefaultQuery("sortBy", "timestamp"),
		SortOrder:    c.DefaultQuery("sortOrder", "desc"),
	}

	// Parse page and limit
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	searchDTO.Page = page
	searchDTO.Limit = limit

	// Parse date range
	if startDate := c.Query("startDate"); startDate != "" {
		if t, err := time.Parse(time.RFC3339, startDate); err == nil {
			searchDTO.StartDate = t
		}
	}

	if endDate := c.Query("endDate"); endDate != "" {
		if t, err := time.Parse(time.RFC3339, endDate); err == nil {
			searchDTO.EndDate = t
		}
	}

	// Parse success filter
	if success := c.Query("success"); success != "" {
		b, _ := strconv.ParseBool(success)
		searchDTO.Success = &b
	}

	logs, err := h.auditLogApp.SearchAuditLogs(c.Request.Context(), searchDTO)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get total count
	count, err := h.auditLogApp.GetAuditLogCount(c.Request.Context(), searchDTO)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"logs":  logs,
		"total": count,
		"page":  searchDTO.Page,
		"limit": searchDTO.Limit,
	})
}

// GetUserActivityLogs handles GET /api/v1/audit-logs/user/:userId
func (h *AuditLogHandler) GetUserActivityLogs(c *gin.Context) {
	userID := c.Param("userId")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	logs, err := h.auditLogApp.GetUserActivityLogs(c.Request.Context(), userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"logs": logs})
}

// GetResourceHistory handles GET /api/v1/audit-logs/resource/:resourceType/:resourceId
func (h *AuditLogHandler) GetResourceHistory(c *gin.Context) {
	resourceType := c.Param("resourceType")
	resourceID := c.Param("resourceId")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	logs, err := h.auditLogApp.GetResourceHistory(c.Request.Context(), resourceType, resourceID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"logs": logs})
}

// GetAuditLogStats handles GET /api/v1/audit-logs/stats
func (h *AuditLogHandler) GetAuditLogStats(c *gin.Context) {
	// Parse date range
	var startDate, endDate time.Time

	if start := c.Query("startDate"); start != "" {
		if t, err := time.Parse(time.RFC3339, start); err == nil {
			startDate = t
		}
	} else {
		// Default to last 30 days
		startDate = time.Now().AddDate(0, 0, -30)
	}

	if end := c.Query("endDate"); end != "" {
		if t, err := time.Parse(time.RFC3339, end); err == nil {
			endDate = t
		}
	} else {
		endDate = time.Now()
	}

	stats, err := h.auditLogApp.GetAuditLogStats(c.Request.Context(), startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// CleanupOldLogs handles DELETE /api/v1/audit-logs/cleanup
func (h *AuditLogHandler) CleanupOldLogs(c *gin.Context) {
	// Get user from context
	userValue, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	user, ok := userValue.(*application.UserDTO)
	if !ok || user.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only admins can cleanup audit logs"})
		return
	}

	// Parse retention days
	retentionDays, _ := strconv.Atoi(c.DefaultQuery("retentionDays", "90"))

	err := h.auditLogApp.CleanupOldLogs(c.Request.Context(), retentionDays)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Audit logs cleaned up successfully",
		"retentionDays": retentionDays,
	})
}
