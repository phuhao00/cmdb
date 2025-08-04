package repository

import (
	"context"
	"time"

	"github.com/phuhao00/cmdb/backend/domain/model"
)

// AuditLogRepository defines the interface for audit log persistence
type AuditLogRepository interface {
	// Create adds a new audit log entry
	Create(ctx context.Context, log *model.AuditLog) error

	// FindByUserID finds all audit logs for a specific user
	FindByUserID(ctx context.Context, userID string, limit int) ([]*model.AuditLog, error)

	// FindByResourceID finds all audit logs for a specific resource
	FindByResourceID(ctx context.Context, resourceType, resourceID string, limit int) ([]*model.AuditLog, error)

	// FindByDateRange finds all audit logs within a date range
	FindByDateRange(ctx context.Context, start, end time.Time, limit int) ([]*model.AuditLog, error)

	// FindByAction finds all audit logs for a specific action
	FindByAction(ctx context.Context, action model.AuditAction, limit int) ([]*model.AuditLog, error)

	// Search performs a comprehensive search across audit logs
	Search(ctx context.Context, criteria AuditLogSearchCriteria) ([]*model.AuditLog, error)

	// Count returns the total number of audit logs matching the criteria
	Count(ctx context.Context, criteria AuditLogSearchCriteria) (int64, error)

	// DeleteOlderThan deletes audit logs older than the specified time
	DeleteOlderThan(ctx context.Context, timestamp time.Time) error
}

// AuditLogSearchCriteria defines search criteria for audit logs
type AuditLogSearchCriteria struct {
	UserID       string
	Username     string
	Action       string
	ResourceType string
	ResourceID   string
	StartDate    time.Time
	EndDate      time.Time
	Success      *bool
	IPAddress    string
	Page         int
	Limit        int
	SortBy       string
	SortOrder    string
}
