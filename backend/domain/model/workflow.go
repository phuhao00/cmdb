package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// WorkflowType represents the type of a workflow
type WorkflowType string

// WorkflowStatus represents the status of a workflow
type WorkflowStatus string

// WorkflowPriority represents the priority of a workflow
type WorkflowPriority string

// Workflow constants
const (
	// Workflow Types
	AssetCreateType        WorkflowType = "Asset Create"
	AssetUpdateType        WorkflowType = "Asset Update"
	AssetDeleteType        WorkflowType = "Asset Delete"
	AssetOnboardingType    WorkflowType = "Asset Onboarding"
	AssetDecommissionType  WorkflowType = "Asset Decommission"
	StatusChangeType       WorkflowType = "Status Change"
	MaintenanceRequestType WorkflowType = "Maintenance Request"

	// Workflow Statuses
	PendingStatus  WorkflowStatus = "pending"
	ApprovedStatus WorkflowStatus = "approved"
	RejectedStatus WorkflowStatus = "rejected"

	// Workflow Priorities
	LowPriority    WorkflowPriority = "low"
	MediumPriority WorkflowPriority = "medium"
	HighPriority   WorkflowPriority = "high"
	UrgentPriority WorkflowPriority = "urgent"
)

// Workflow represents an approval workflow in the CMDB domain
type Workflow struct {
	ID           primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	WorkflowID   string             `json:"workflowId" bson:"workflowId"`
	Type         WorkflowType       `json:"type" bson:"type"`
	AssetID      string             `json:"assetId" bson:"assetId"`
	AssetName    string             `json:"assetName" bson:"assetName"`
	Requester    string             `json:"requester" bson:"requester"`
	RequesterID  string             `json:"requesterId" bson:"requesterId"`
	Priority     WorkflowPriority   `json:"priority" bson:"priority"`
	Status       WorkflowStatus     `json:"status" bson:"status"`
	Reason       string             `json:"reason" bson:"reason"`
	FeishuID     string             `json:"feishuId" bson:"feishuId"`
	ApproverID   string             `json:"approverId,omitempty" bson:"approverId,omitempty"`
	ApproverName string             `json:"approverName,omitempty" bson:"approverName,omitempty"`
	ApprovedAt   *time.Time         `json:"approvedAt,omitempty" bson:"approvedAt,omitempty"`
	Comments     string             `json:"comments,omitempty" bson:"comments,omitempty"`
	Data         interface{}        `json:"data,omitempty" bson:"data,omitempty"`
	CreatedAt    time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt    time.Time          `json:"updatedAt" bson:"updatedAt"`
}

// NewWorkflow creates a new workflow with default values
func NewWorkflow(
	workflowType WorkflowType,
	assetID string,
	assetName string,
	requester string,
	requesterID string,
	priority WorkflowPriority,
	reason string,
	data interface{},
) *Workflow {
	now := time.Now()
	return &Workflow{
		Type:        workflowType,
		AssetID:     assetID,
		AssetName:   assetName,
		Requester:   requester,
		RequesterID: requesterID,
		Priority:    priority,
		Status:      PendingStatus,
		Reason:      reason,
		Data:        data,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// Approve approves the workflow and updates the UpdatedAt timestamp
func (w *Workflow) Approve(approverID, approverName, comments string) {
	now := time.Now()
	w.Status = ApprovedStatus
	w.ApproverID = approverID
	w.ApproverName = approverName
	w.Comments = comments
	w.ApprovedAt = &now
	w.UpdatedAt = now
}

// Reject rejects the workflow and updates the UpdatedAt timestamp
func (w *Workflow) Reject(approverID, approverName, comments string) {
	w.Status = RejectedStatus
	w.ApproverID = approverID
	w.ApproverName = approverName
	w.Comments = comments
	w.UpdatedAt = time.Now()
}

// SetFeishuID sets the Feishu ID for the workflow
func (w *Workflow) SetFeishuID(feishuID string) {
	w.FeishuID = feishuID
}

// IsPending checks if the workflow is pending
func (w *Workflow) IsPending() bool {
	return w.Status == PendingStatus
}

// IsApproved checks if the workflow is approved
func (w *Workflow) IsApproved() bool {
	return w.Status == ApprovedStatus
}

// IsRejected checks if the workflow is rejected
func (w *Workflow) IsRejected() bool {
	return w.Status == RejectedStatus
}

// IsAssetOnboarding checks if the workflow is for asset onboarding
func (w *Workflow) IsAssetOnboarding() bool {
	return w.Type == AssetOnboardingType
}

// IsAssetDecommission checks if the workflow is for asset decommission
func (w *Workflow) IsAssetDecommission() bool {
	return w.Type == AssetDecommissionType
}

// IsStatusChange checks if the workflow is for status change
func (w *Workflow) IsStatusChange() bool {
	return w.Type == StatusChangeType
}

// IsMaintenanceRequest checks if the workflow is for maintenance request
func (w *Workflow) IsMaintenanceRequest() bool {
	return w.Type == MaintenanceRequestType
}

// IsAssetCreate checks if the workflow is for asset creation
func (w *Workflow) IsAssetCreate() bool {
	return w.Type == AssetCreateType
}

// IsAssetUpdate checks if the workflow is for asset update
func (w *Workflow) IsAssetUpdate() bool {
	return w.Type == AssetUpdateType
}

// IsAssetDelete checks if the workflow is for asset deletion
func (w *Workflow) IsAssetDelete() bool {
	return w.Type == AssetDeleteType
}
