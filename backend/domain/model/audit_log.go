package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AuditAction represents the type of action performed
type AuditAction string

const (
	// Asset related actions
	AssetCreated       AuditAction = "asset_created"
	AssetUpdated       AuditAction = "asset_updated"
	AssetDeleted       AuditAction = "asset_deleted"
	AssetStatusChanged AuditAction = "asset_status_changed"
	AssetTagsUpdated   AuditAction = "asset_tags_updated"
	AssetOwnerChanged  AuditAction = "asset_owner_changed"

	// Workflow related actions
	WorkflowCreated   AuditAction = "workflow_created"
	WorkflowApproved  AuditAction = "workflow_approved"
	WorkflowRejected  AuditAction = "workflow_rejected"
	WorkflowCompleted AuditAction = "workflow_completed"

	// User related actions
	UserLoggedIn        AuditAction = "user_logged_in"
	UserLoggedOut       AuditAction = "user_logged_out"
	UserCreated         AuditAction = "user_created"
	UserUpdated         AuditAction = "user_updated"
	UserPasswordChanged AuditAction = "user_password_changed"

	// Report related actions
	ReportGenerated  AuditAction = "report_generated"
	ReportDownloaded AuditAction = "report_downloaded"
)

// AuditLog represents an audit log entry
type AuditLog struct {
	ID           primitive.ObjectID     `json:"id" bson:"_id,omitempty"`
	UserID       string                 `json:"userId" bson:"userId"`
	Username     string                 `json:"username" bson:"username"`
	Action       AuditAction            `json:"action" bson:"action"`
	ResourceType string                 `json:"resourceType" bson:"resourceType"`
	ResourceID   string                 `json:"resourceId" bson:"resourceId"`
	ResourceName string                 `json:"resourceName" bson:"resourceName"`
	Description  string                 `json:"description" bson:"description"`
	IPAddress    string                 `json:"ipAddress" bson:"ipAddress"`
	UserAgent    string                 `json:"userAgent" bson:"userAgent"`
	OldValue     map[string]interface{} `json:"oldValue,omitempty" bson:"oldValue,omitempty"`
	NewValue     map[string]interface{} `json:"newValue,omitempty" bson:"newValue,omitempty"`
	Success      bool                   `json:"success" bson:"success"`
	ErrorMessage string                 `json:"errorMessage,omitempty" bson:"errorMessage,omitempty"`
	Timestamp    time.Time              `json:"timestamp" bson:"timestamp"`
}

// NewAuditLog creates a new audit log entry
func NewAuditLog(userID, username string, action AuditAction, resourceType, resourceID, resourceName, description string) *AuditLog {
	return &AuditLog{
		UserID:       userID,
		Username:     username,
		Action:       action,
		ResourceType: resourceType,
		ResourceID:   resourceID,
		ResourceName: resourceName,
		Description:  description,
		Success:      true,
		Timestamp:    time.Now(),
	}
}

// SetIPAddress sets the IP address of the user
func (a *AuditLog) SetIPAddress(ip string) {
	a.IPAddress = ip
}

// SetUserAgent sets the user agent of the request
func (a *AuditLog) SetUserAgent(userAgent string) {
	a.UserAgent = userAgent
}

// SetChanges sets the old and new values for the change
func (a *AuditLog) SetChanges(oldValue, newValue map[string]interface{}) {
	a.OldValue = oldValue
	a.NewValue = newValue
}

// SetError marks the audit log as failed with an error message
func (a *AuditLog) SetError(errorMessage string) {
	a.Success = false
	a.ErrorMessage = errorMessage
}
