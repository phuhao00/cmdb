package service

import (
	"context"
	"fmt"
	"time"

	"github.com/phuhao00/cmdb/backend/domain/model"
	"github.com/phuhao00/cmdb/backend/domain/repository"
)

// AuditLogService handles audit log business logic
type AuditLogService struct {
	auditLogRepo repository.AuditLogRepository
}

// NewAuditLogService creates a new audit log service
func NewAuditLogService(auditLogRepo repository.AuditLogRepository) *AuditLogService {
	return &AuditLogService{
		auditLogRepo: auditLogRepo,
	}
}

// LogAssetCreated logs an asset creation event
func (s *AuditLogService) LogAssetCreated(ctx context.Context, userID, username string, asset *model.Asset, ipAddress, userAgent string) error {
	log := model.NewAuditLog(
		userID,
		username,
		model.AssetCreated,
		"asset",
		asset.ID.Hex(),
		asset.Name,
		fmt.Sprintf("Created asset: %s", asset.Name),
	)

	log.SetIPAddress(ipAddress)
	log.SetUserAgent(userAgent)

	newValue := map[string]interface{}{
		"name":     asset.Name,
		"type":     asset.Type,
		"status":   asset.Status,
		"location": asset.Location,
	}
	log.SetChanges(nil, newValue)

	return s.auditLogRepo.Create(ctx, log)
}

// LogAssetUpdated logs an asset update event
func (s *AuditLogService) LogAssetUpdated(ctx context.Context, userID, username string, oldAsset, newAsset *model.Asset, ipAddress, userAgent string) error {
	log := model.NewAuditLog(
		userID,
		username,
		model.AssetUpdated,
		"asset",
		newAsset.ID.Hex(),
		newAsset.Name,
		fmt.Sprintf("Updated asset: %s", newAsset.Name),
	)

	log.SetIPAddress(ipAddress)
	log.SetUserAgent(userAgent)

	// Capture changed fields
	oldValue := map[string]interface{}{}
	newValue := map[string]interface{}{}

	if oldAsset.Name != newAsset.Name {
		oldValue["name"] = oldAsset.Name
		newValue["name"] = newAsset.Name
	}

	if oldAsset.Location != newAsset.Location {
		oldValue["location"] = oldAsset.Location
		newValue["location"] = newAsset.Location
	}

	if oldAsset.Description != newAsset.Description {
		oldValue["description"] = oldAsset.Description
		newValue["description"] = newAsset.Description
	}

	if oldAsset.Status != newAsset.Status {
		oldValue["status"] = oldAsset.Status
		newValue["status"] = newAsset.Status
	}

	log.SetChanges(oldValue, newValue)

	return s.auditLogRepo.Create(ctx, log)
}

// LogAssetStatusChanged logs an asset status change event
func (s *AuditLogService) LogAssetStatusChanged(ctx context.Context, userID, username string, asset *model.Asset, oldStatus, newStatus model.AssetStatus, ipAddress, userAgent string) error {
	log := model.NewAuditLog(
		userID,
		username,
		model.AssetStatusChanged,
		"asset",
		asset.ID.Hex(),
		asset.Name,
		fmt.Sprintf("Changed status of asset %s from %s to %s", asset.Name, oldStatus, newStatus),
	)

	log.SetIPAddress(ipAddress)
	log.SetUserAgent(userAgent)

	log.SetChanges(
		map[string]interface{}{"status": oldStatus},
		map[string]interface{}{"status": newStatus},
	)

	return s.auditLogRepo.Create(ctx, log)
}

// LogWorkflowCreated logs a workflow creation event
func (s *AuditLogService) LogWorkflowCreated(ctx context.Context, userID, username string, workflow *model.Workflow, ipAddress, userAgent string) error {
	log := model.NewAuditLog(
		userID,
		username,
		model.WorkflowCreated,
		"workflow",
		workflow.ID.Hex(),
		workflow.AssetName,
		fmt.Sprintf("Created workflow for asset: %s", workflow.AssetName),
	)

	log.SetIPAddress(ipAddress)
	log.SetUserAgent(userAgent)

	newValue := map[string]interface{}{
		"type":      workflow.Type,
		"status":    workflow.Status,
		"assetId":   workflow.AssetID,
		"assetName": workflow.AssetName,
	}
	log.SetChanges(nil, newValue)

	return s.auditLogRepo.Create(ctx, log)
}

// LogWorkflowApproved logs a workflow approval event
func (s *AuditLogService) LogWorkflowApproved(ctx context.Context, userID, username string, workflow *model.Workflow, ipAddress, userAgent string) error {
	log := model.NewAuditLog(
		userID,
		username,
		model.WorkflowApproved,
		"workflow",
		workflow.ID.Hex(),
		workflow.AssetName,
		fmt.Sprintf("Approved workflow for asset: %s", workflow.AssetName),
	)

	log.SetIPAddress(ipAddress)
	log.SetUserAgent(userAgent)

	return s.auditLogRepo.Create(ctx, log)
}

// LogWorkflowRejected logs a workflow rejection event
func (s *AuditLogService) LogWorkflowRejected(ctx context.Context, userID, username string, workflow *model.Workflow, reason, ipAddress, userAgent string) error {
	log := model.NewAuditLog(
		userID,
		username,
		model.WorkflowRejected,
		"workflow",
		workflow.ID.Hex(),
		workflow.AssetName,
		fmt.Sprintf("Rejected workflow for asset: %s. Reason: %s", workflow.AssetName, reason),
	)

	log.SetIPAddress(ipAddress)
	log.SetUserAgent(userAgent)

	return s.auditLogRepo.Create(ctx, log)
}

// LogUserLogin logs a user login event
func (s *AuditLogService) LogUserLogin(ctx context.Context, userID, username, ipAddress, userAgent string) error {
	log := model.NewAuditLog(
		userID,
		username,
		model.UserLoggedIn,
		"user",
		userID,
		username,
		fmt.Sprintf("User %s logged in", username),
	)

	log.SetIPAddress(ipAddress)
	log.SetUserAgent(userAgent)

	return s.auditLogRepo.Create(ctx, log)
}

// LogUserLogout logs a user logout event
func (s *AuditLogService) LogUserLogout(ctx context.Context, userID, username, ipAddress, userAgent string) error {
	log := model.NewAuditLog(
		userID,
		username,
		model.UserLoggedOut,
		"user",
		userID,
		username,
		fmt.Sprintf("User %s logged out", username),
	)

	log.SetIPAddress(ipAddress)
	log.SetUserAgent(userAgent)

	return s.auditLogRepo.Create(ctx, log)
}

// LogReportGenerated logs a report generation event
func (s *AuditLogService) LogReportGenerated(ctx context.Context, userID, username, reportType, ipAddress, userAgent string) error {
	log := model.NewAuditLog(
		userID,
		username,
		model.ReportGenerated,
		"report",
		reportType,
		reportType,
		fmt.Sprintf("Generated %s report", reportType),
	)

	log.SetIPAddress(ipAddress)
	log.SetUserAgent(userAgent)

	return s.auditLogRepo.Create(ctx, log)
}

// GetUserActivityLogs retrieves activity logs for a specific user
func (s *AuditLogService) GetUserActivityLogs(ctx context.Context, userID string, limit int) ([]*model.AuditLog, error) {
	return s.auditLogRepo.FindByUserID(ctx, userID, limit)
}

// GetResourceHistory retrieves the history of changes for a specific resource
func (s *AuditLogService) GetResourceHistory(ctx context.Context, resourceType, resourceID string, limit int) ([]*model.AuditLog, error) {
	return s.auditLogRepo.FindByResourceID(ctx, resourceType, resourceID, limit)
}

// SearchAuditLogs searches audit logs based on criteria
func (s *AuditLogService) SearchAuditLogs(ctx context.Context, criteria repository.AuditLogSearchCriteria) ([]*model.AuditLog, error) {
	return s.auditLogRepo.Search(ctx, criteria)
}

// GetAuditLogCount gets the count of audit logs matching criteria
func (s *AuditLogService) GetAuditLogCount(ctx context.Context, criteria repository.AuditLogSearchCriteria) (int64, error) {
	return s.auditLogRepo.Count(ctx, criteria)
}

// CleanupOldLogs removes audit logs older than the retention period
func (s *AuditLogService) CleanupOldLogs(ctx context.Context, retentionDays int) error {
	cutoffDate := time.Now().AddDate(0, 0, -retentionDays)
	return s.auditLogRepo.DeleteOlderThan(ctx, cutoffDate)
}
