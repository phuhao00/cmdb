package application

import (
	"context"
	"time"

	"github.com/cmdb/backend/domain/model"
	"github.com/cmdb/backend/domain/service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// WorkflowDTO represents the data transfer object for workflows
type WorkflowDTO struct {
	ID         string    `json:"id"`
	WorkflowID string    `json:"workflowId"`
	Type       string    `json:"type"`
	AssetID    string    `json:"assetId"`
	AssetName  string    `json:"assetName"`
	Requester  string    `json:"requester"`
	Priority   string    `json:"priority"`
	Status     string    `json:"status"`
	Reason     string    `json:"reason"`
	FeishuID   string    `json:"feishuId"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// WorkflowCreateDTO represents the data for creating a workflow
type WorkflowCreateDTO struct {
	Type        string `json:"type" binding:"required"`
	AssetID     string `json:"assetId" binding:"required"`
	Requester   string `json:"requester" binding:"required"`
	RequesterID string `json:"requesterId"`
	Priority    string `json:"priority" binding:"required"`
	Reason      string `json:"reason" binding:"required"`
}

// FeishuWebhookDTO represents the data from a Feishu webhook
type FeishuWebhookDTO struct {
	ApprovalCode string `json:"approval_code"`
	Status       string `json:"status"`
	WorkflowID   string `json:"workflow_id"`
}

// WorkflowFilterDTO represents the filter criteria for workflows
type WorkflowFilterDTO struct {
	Status string `form:"status"`
	Type   string `form:"type"`
}

// ApproveWorkflowDTO represents approve workflow request data
type ApproveWorkflowDTO struct {
	Comments string `json:"comments"`
}

// RejectWorkflowDTO represents reject workflow request data
type RejectWorkflowDTO struct {
	Comments string `json:"comments" binding:"required"`
}

// WorkflowApplication provides application services for workflows
type WorkflowApplication struct {
	workflowService *service.WorkflowService
}

// NewWorkflowApplication creates a new workflow application service
func NewWorkflowApplication(workflowService *service.WorkflowService) *WorkflowApplication {
	return &WorkflowApplication{
		workflowService: workflowService,
	}
}

// GetWorkflowByID gets a workflow by ID
func (a *WorkflowApplication) GetWorkflowByID(ctx context.Context, id string) (*WorkflowDTO, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	workflow, err := a.workflowService.GetWorkflowByID(ctx, objectID)
	if err != nil {
		return nil, err
	}

	return mapWorkflowToDTO(workflow), nil
}

// GetWorkflows gets workflows with optional filtering
func (a *WorkflowApplication) GetWorkflows(ctx context.Context, filter WorkflowFilterDTO) ([]*WorkflowDTO, error) {
	// Convert filter to map
	filterMap := make(map[string]interface{})

	if filter.Status != "" {
		filterMap["status"] = filter.Status
	}

	if filter.Type != "" {
		filterMap["type"] = filter.Type
	}

	workflows, err := a.workflowService.GetWorkflows(ctx, filterMap)
	if err != nil {
		return nil, err
	}

	// Map workflows to DTOs
	workflowDTOs := make([]*WorkflowDTO, len(workflows))
	for i, workflow := range workflows {
		workflowDTOs[i] = mapWorkflowToDTO(workflow)
	}

	return workflowDTOs, nil
}

// CreateWorkflow creates a new workflow
func (a *WorkflowApplication) CreateWorkflow(ctx context.Context, createDTO WorkflowCreateDTO) (*WorkflowDTO, error) {
	requesterID := createDTO.RequesterID
	if requesterID == "" {
		requesterID = "unknown"
	}

	workflow, err := a.workflowService.CreateWorkflow(
		ctx,
		createDTO.Type,
		createDTO.AssetID,
		createDTO.Requester,
		requesterID,
		createDTO.Priority,
		createDTO.Reason,
		nil,
	)
	if err != nil {
		return nil, err
	}

	// Submit to Feishu
	feishuID, err := a.workflowService.SubmitToFeishu(ctx, workflow)
	if err != nil {
		return nil, err
	}

	workflow.SetFeishuID(feishuID)

	return mapWorkflowToDTO(workflow), nil
}

// ApproveWorkflow approves a workflow
func (a *WorkflowApplication) ApproveWorkflow(ctx context.Context, workflowID, approverID, approverName string, dto ApproveWorkflowDTO) error {
	return a.workflowService.ApproveWorkflow(ctx, workflowID, approverID, approverName, dto.Comments)
}

// RejectWorkflow rejects a workflow
func (a *WorkflowApplication) RejectWorkflow(ctx context.Context, workflowID, approverID, approverName string, dto RejectWorkflowDTO) error {
	return a.workflowService.RejectWorkflow(ctx, workflowID, approverID, approverName, dto.Comments)
}

// HandleFeishuWebhook handles a webhook from Feishu
func (a *WorkflowApplication) HandleFeishuWebhook(ctx context.Context, webhookDTO FeishuWebhookDTO) error {
	return a.workflowService.HandleFeishuWebhook(ctx, webhookDTO.WorkflowID, webhookDTO.Status)
}

// GetWorkflowStats gets workflow statistics
func (a *WorkflowApplication) GetWorkflowStats(ctx context.Context) (map[string]int64, error) {
	return a.workflowService.GetWorkflowStats(ctx)
}

// GetWorkflowTypeStats gets workflow type statistics
func (a *WorkflowApplication) GetWorkflowTypeStats(ctx context.Context) (map[string]int64, error) {
	return a.workflowService.GetWorkflowTypeStats(ctx)
}

// GetAssetWorkflowHistory gets workflow history for an asset
func (a *WorkflowApplication) GetAssetWorkflowHistory(ctx context.Context, assetID string) ([]*WorkflowDTO, error) {
	workflows, err := a.workflowService.GetAssetWorkflowHistory(ctx, assetID)
	if err != nil {
		return nil, err
	}

	// Map workflows to DTOs
	workflowDTOs := make([]*WorkflowDTO, len(workflows))
	for i, workflow := range workflows {
		workflowDTOs[i] = mapWorkflowToDTO(workflow)
	}

	return workflowDTOs, nil
}

// GetPendingWorkflows returns pending workflows for approval
func (a *WorkflowApplication) GetPendingWorkflows(ctx context.Context) ([]*WorkflowDTO, error) {
	workflows, err := a.workflowService.GetPendingWorkflows(ctx)
	if err != nil {
		return nil, err
	}

	var workflowDTOs []*WorkflowDTO
	for _, workflow := range workflows {
		workflowDTOs = append(workflowDTOs, mapWorkflowToDTO(workflow))
	}

	return workflowDTOs, nil
}

// GetUserWorkflows returns workflows created by a specific user
func (a *WorkflowApplication) GetUserWorkflows(ctx context.Context, userID string) ([]*WorkflowDTO, error) {
	workflows, err := a.workflowService.GetUserWorkflows(ctx, userID)
	if err != nil {
		return nil, err
	}

	var workflowDTOs []*WorkflowDTO
	for _, workflow := range workflows {
		workflowDTOs = append(workflowDTOs, mapWorkflowToDTO(workflow))
	}

	return workflowDTOs, nil
}

// Helper function to map a workflow to a DTO
func mapWorkflowToDTO(workflow *model.Workflow) *WorkflowDTO {
	return &WorkflowDTO{
		ID:         workflow.ID.Hex(),
		WorkflowID: workflow.WorkflowID,
		Type:       string(workflow.Type),
		AssetID:    workflow.AssetID,
		AssetName:  workflow.AssetName,
		Requester:  workflow.Requester,
		Priority:   string(workflow.Priority),
		Status:     string(workflow.Status),
		Reason:     workflow.Reason,
		FeishuID:   workflow.FeishuID,
		CreatedAt:  workflow.CreatedAt,
		UpdatedAt:  workflow.UpdatedAt,
	}
}
