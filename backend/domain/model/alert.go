package model

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AlertSeverity represents the severity level of an alert
type AlertSeverity string

// AlertStatus represents the status of an alert
type AlertStatus string

// AlertType represents the type of alert
type AlertType string

const (
	// Severity levels
	SeverityCritical AlertSeverity = "critical"
	SeverityHigh     AlertSeverity = "high"
	SeverityMedium   AlertSeverity = "medium"
	SeverityLow      AlertSeverity = "low"
	SeverityInfo     AlertSeverity = "info"

	// Alert statuses
	AlertStatusActive       AlertStatus = "active"
	AlertStatusAcknowledged AlertStatus = "acknowledged"
	AlertStatusResolved     AlertStatus = "resolved"
	AlertStatusClosed       AlertStatus = "closed"

	// Alert types
	AlertTypeStatusChange   AlertType = "status_change"
	AlertTypeThreshold      AlertType = "threshold"
	AlertTypeMaintenance    AlertType = "maintenance"
	AlertTypeExpiry         AlertType = "expiry"
	AlertTypePerformance    AlertType = "performance"
	AlertTypeSecurityUpdate AlertType = "security_update"
	AlertTypeCustom         AlertType = "custom"
)

// Alert represents an alert for an asset
type Alert struct {
	ID               primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	AssetID          primitive.ObjectID `json:"assetId" bson:"assetId"`
	AssetName        string             `json:"assetName" bson:"assetName"`
	Type             AlertType          `json:"type" bson:"type"`
	Severity         AlertSeverity      `json:"severity" bson:"severity"`
	Status           AlertStatus        `json:"status" bson:"status"`
	Title            string             `json:"title" bson:"title"`
	Description      string             `json:"description" bson:"description"`
	Condition        string             `json:"condition" bson:"condition"`
	CurrentValue     interface{}        `json:"currentValue" bson:"currentValue"`
	ThresholdValue   interface{}        `json:"thresholdValue" bson:"thresholdValue"`
	AcknowledgedBy   string             `json:"acknowledgedBy,omitempty" bson:"acknowledgedBy,omitempty"`
	AcknowledgedByID string             `json:"acknowledgedById,omitempty" bson:"acknowledgedById,omitempty"`
	AcknowledgedAt   *time.Time         `json:"acknowledgedAt,omitempty" bson:"acknowledgedAt,omitempty"`
	ResolvedBy       string             `json:"resolvedBy,omitempty" bson:"resolvedBy,omitempty"`
	ResolvedByID     string             `json:"resolvedById,omitempty" bson:"resolvedById,omitempty"`
	ResolvedAt       *time.Time         `json:"resolvedAt,omitempty" bson:"resolvedAt,omitempty"`
	Resolution       string             `json:"resolution,omitempty" bson:"resolution,omitempty"`
	NotificationSent bool               `json:"notificationSent" bson:"notificationSent"`
	CreatedAt        time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt        time.Time          `json:"updatedAt" bson:"updatedAt"`
}

// AlertRule defines rules for generating alerts
type AlertRule struct {
	ID          primitive.ObjectID     `json:"id" bson:"_id,omitempty"`
	Name        string                 `json:"name" bson:"name"`
	Description string                 `json:"description" bson:"description"`
	Type        AlertType              `json:"type" bson:"type"`
	Severity    AlertSeverity          `json:"severity" bson:"severity"`
	Condition   string                 `json:"condition" bson:"condition"`
	Threshold   interface{}            `json:"threshold" bson:"threshold"`
	Field       string                 `json:"field" bson:"field"`
	Operator    string                 `json:"operator" bson:"operator"` // gt, lt, eq, ne, gte, lte
	Enabled     bool                   `json:"enabled" bson:"enabled"`
	AssetFilter map[string]interface{} `json:"assetFilter" bson:"assetFilter"`
	CreatedAt   time.Time              `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time              `json:"updatedAt" bson:"updatedAt"`
}

// NewAlert creates a new alert
func NewAlert(assetID primitive.ObjectID, assetName string, alertType AlertType, severity AlertSeverity, title, description string) *Alert {
	now := time.Now()
	return &Alert{
		ID:               primitive.NewObjectID(),
		AssetID:          assetID,
		AssetName:        assetName,
		Type:             alertType,
		Severity:         severity,
		Status:           AlertStatusActive,
		Title:            title,
		Description:      description,
		NotificationSent: false,
		CreatedAt:        now,
		UpdatedAt:        now,
	}
}

// Acknowledge marks the alert as acknowledged
func (a *Alert) Acknowledge(userID, username string) {
	now := time.Now()
	a.Status = AlertStatusAcknowledged
	a.AcknowledgedBy = username
	a.AcknowledgedByID = userID
	a.AcknowledgedAt = &now
	a.UpdatedAt = now
}

// Resolve marks the alert as resolved
func (a *Alert) Resolve(userID, username, resolution string) {
	now := time.Now()
	a.Status = AlertStatusResolved
	a.ResolvedBy = username
	a.ResolvedByID = userID
	a.ResolvedAt = &now
	a.Resolution = resolution
	a.UpdatedAt = now
}

// Close marks the alert as closed
func (a *Alert) Close() {
	a.Status = AlertStatusClosed
	a.UpdatedAt = time.Now()
}

// IsCritical checks if the alert is critical
func (a *Alert) IsCritical() bool {
	return a.Severity == SeverityCritical
}

// IsActive checks if the alert is active
func (a *Alert) IsActive() bool {
	return a.Status == AlertStatusActive
}

// GetSeverityWeight returns numeric weight for severity (for sorting)
func (a *Alert) GetSeverityWeight() int {
	switch a.Severity {
	case SeverityCritical:
		return 5
	case SeverityHigh:
		return 4
	case SeverityMedium:
		return 3
	case SeverityLow:
		return 2
	case SeverityInfo:
		return 1
	default:
		return 0
	}
}

// NewAlertRule creates a new alert rule
func NewAlertRule(name, description string, alertType AlertType, severity AlertSeverity) *AlertRule {
	now := time.Now()
	return &AlertRule{
		ID:          primitive.NewObjectID(),
		Name:        name,
		Description: description,
		Type:        alertType,
		Severity:    severity,
		Enabled:     true,
		AssetFilter: make(map[string]interface{}),
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// SetCondition sets the condition for the alert rule
func (r *AlertRule) SetCondition(field, operator string, threshold interface{}) {
	r.Field = field
	r.Operator = operator
	r.Threshold = threshold
	r.Condition = field + " " + operator + " " + formatThreshold(threshold)
	r.UpdatedAt = time.Now()
}

// formatThreshold formats the threshold value for display
func formatThreshold(threshold interface{}) string {
	switch v := threshold.(type) {
	case string:
		return v
	case int, int64, float64:
		return fmt.Sprintf("%v", v)
	default:
		return fmt.Sprintf("%v", v)
	}
}