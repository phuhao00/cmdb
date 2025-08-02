package application

import (
	"context"
	"time"

	"github.com/yourusername/cmdb/backend/domain/model"
	"github.com/yourusername/cmdb/backend/domain/repository"
	"github.com/yourusername/cmdb/backend/domain/service"
)

// AuditLogApplication handles audit log application logic
type AuditLogApplication struct {
	auditLogService *service.AuditLogService
}

// NewAuditLogApplication creates a new audit log application
func NewAuditLogApplication(auditLogService *service.AuditLogService) *AuditLogApplication {
	return &AuditLogApplication{
		auditLogService: auditLogService,
	}
}

// AuditLogDTO represents an audit log data transfer object
type AuditLogDTO struct {
	ID           string                 `json:"id"`
	UserID       string                 `json:"userId"`
	Username     string                 `json:"username"`
	Action       string                 `json:"action"`
	ResourceType string                 `json:"resourceType"`
	ResourceID   string                 `json:"resourceId"`
	ResourceName string                 `json:"resourceName"`
	Description  string                 `json:"description"`
	IPAddress    string                 `json:"ipAddress"`
	UserAgent    string                 `json:"userAgent"`
	OldValue     map[string]interface{} `json:"oldValue,omitempty"`
	NewValue     map[string]interface{} `json:"newValue,omitempty"`
	Success      bool                   `json:"success"`
	ErrorMessage string                 `json:"errorMessage,omitempty"`
	Timestamp    time.Time              `json:"timestamp"`
}

// AuditLogSearchDTO represents search criteria for audit logs
type AuditLogSearchDTO struct {
	UserID       string    `json:"userId"`
	Username     string    `json:"username"`
	Action       string    `json:"action"`
	ResourceType string    `json:"resourceType"`
	ResourceID   string    `json:"resourceId"`
	StartDate    time.Time `json:"startDate"`
	EndDate      time.Time `json:"endDate"`
	Success      *bool     `json:"success,omitempty"`
	IPAddress    string    `json:"ipAddress"`
	Page         int       `json:"page"`
	Limit        int       `json:"limit"`
	SortBy       string    `json:"sortBy"`
	SortOrder    string    `json:"sortOrder"`
}

// AuditLogStatsDTO represents audit log statistics
type AuditLogStatsDTO struct {
	TotalLogs       int64             `json:"totalLogs"`
	SuccessfulLogs  int64             `json:"successfulLogs"`
	FailedLogs      int64             `json:"failedLogs"`
	LogsByAction    map[string]int64  `json:"logsByAction"`
	LogsByResource  map[string]int64  `json:"logsByResource"`
	MostActiveUsers []UserActivityDTO `json:"mostActiveUsers"`
}

// UserActivityDTO represents user activity statistics
type UserActivityDTO struct {
	UserID   string `json:"userId"`
	Username string `json:"username"`
	Actions  int64  `json:"actions"`
}

// GetUserActivityLogs retrieves activity logs for a specific user
func (a *AuditLogApplication) GetUserActivityLogs(ctx context.Context, userID string, limit int) ([]*AuditLogDTO, error) {
	logs, err := a.auditLogService.GetUserActivityLogs(ctx, userID, limit)
	if err != nil {
		return nil, err
	}

	return a.toAuditLogDTOs(logs), nil
}

// GetResourceHistory retrieves the history of changes for a specific resource
func (a *AuditLogApplication) GetResourceHistory(ctx context.Context, resourceType, resourceID string, limit int) ([]*AuditLogDTO, error) {
	logs, err := a.auditLogService.GetResourceHistory(ctx, resourceType, resourceID, limit)
	if err != nil {
		return nil, err
	}

	return a.toAuditLogDTOs(logs), nil
}

// SearchAuditLogs searches audit logs based on criteria
func (a *AuditLogApplication) SearchAuditLogs(ctx context.Context, searchDTO AuditLogSearchDTO) ([]*AuditLogDTO, error) {
	// Set default values
	if searchDTO.Page < 1 {
		searchDTO.Page = 1
	}
	if searchDTO.Limit < 1 {
		searchDTO.Limit = 50
	}
	if searchDTO.Limit > 1000 {
		searchDTO.Limit = 1000
	}

	criteria := repository.AuditLogSearchCriteria{
		UserID:       searchDTO.UserID,
		Username:     searchDTO.Username,
		Action:       searchDTO.Action,
		ResourceType: searchDTO.ResourceType,
		ResourceID:   searchDTO.ResourceID,
		StartDate:    searchDTO.StartDate,
		EndDate:      searchDTO.EndDate,
		Success:      searchDTO.Success,
		IPAddress:    searchDTO.IPAddress,
		Page:         searchDTO.Page,
		Limit:        searchDTO.Limit,
		SortBy:       searchDTO.SortBy,
		SortOrder:    searchDTO.SortOrder,
	}

	logs, err := a.auditLogService.SearchAuditLogs(ctx, criteria)
	if err != nil {
		return nil, err
	}

	return a.toAuditLogDTOs(logs), nil
}

// GetAuditLogCount gets the count of audit logs matching criteria
func (a *AuditLogApplication) GetAuditLogCount(ctx context.Context, searchDTO AuditLogSearchDTO) (int64, error) {
	criteria := repository.AuditLogSearchCriteria{
		UserID:       searchDTO.UserID,
		Username:     searchDTO.Username,
		Action:       searchDTO.Action,
		ResourceType: searchDTO.ResourceType,
		ResourceID:   searchDTO.ResourceID,
		StartDate:    searchDTO.StartDate,
		EndDate:      searchDTO.EndDate,
		Success:      searchDTO.Success,
		IPAddress:    searchDTO.IPAddress,
	}

	return a.auditLogService.GetAuditLogCount(ctx, criteria)
}

// GetAuditLogStats retrieves audit log statistics
func (a *AuditLogApplication) GetAuditLogStats(ctx context.Context, startDate, endDate time.Time) (*AuditLogStatsDTO, error) {
	// Get total logs
	totalCriteria := repository.AuditLogSearchCriteria{
		StartDate: startDate,
		EndDate:   endDate,
	}
	totalLogs, err := a.auditLogService.GetAuditLogCount(ctx, totalCriteria)
	if err != nil {
		return nil, err
	}

	// Get successful logs
	successTrue := true
	successCriteria := repository.AuditLogSearchCriteria{
		StartDate: startDate,
		EndDate:   endDate,
		Success:   &successTrue,
	}
	successfulLogs, err := a.auditLogService.GetAuditLogCount(ctx, successCriteria)
	if err != nil {
		return nil, err
	}

	// Get failed logs
	successFalse := false
	failCriteria := repository.AuditLogSearchCriteria{
		StartDate: startDate,
		EndDate:   endDate,
		Success:   &successFalse,
	}
	failedLogs, err := a.auditLogService.GetAuditLogCount(ctx, failCriteria)
	if err != nil {
		return nil, err
	}

	stats := &AuditLogStatsDTO{
		TotalLogs:       totalLogs,
		SuccessfulLogs:  successfulLogs,
		FailedLogs:      failedLogs,
		LogsByAction:    make(map[string]int64),
		LogsByResource:  make(map[string]int64),
		MostActiveUsers: []UserActivityDTO{},
	}

	return stats, nil
}

// CleanupOldLogs removes audit logs older than the retention period
func (a *AuditLogApplication) CleanupOldLogs(ctx context.Context, retentionDays int) error {
	return a.auditLogService.CleanupOldLogs(ctx, retentionDays)
}

// toAuditLogDTO converts a domain model to DTO
func (a *AuditLogApplication) toAuditLogDTO(log *model.AuditLog) *AuditLogDTO {
	return &AuditLogDTO{
		ID:           log.ID.Hex(),
		UserID:       log.UserID,
		Username:     log.Username,
		Action:       string(log.Action),
		ResourceType: log.ResourceType,
		ResourceID:   log.ResourceID,
		ResourceName: log.ResourceName,
		Description:  log.Description,
		IPAddress:    log.IPAddress,
		UserAgent:    log.UserAgent,
		OldValue:     log.OldValue,
		NewValue:     log.NewValue,
		Success:      log.Success,
		ErrorMessage: log.ErrorMessage,
		Timestamp:    log.Timestamp,
	}
}

// toAuditLogDTOs converts domain models to DTOs
func (a *AuditLogApplication) toAuditLogDTOs(logs []*model.AuditLog) []*AuditLogDTO {
	dtos := make([]*AuditLogDTO, len(logs))
	for i, log := range logs {
		dtos[i] = a.toAuditLogDTO(log)
	}
	return dtos
}
