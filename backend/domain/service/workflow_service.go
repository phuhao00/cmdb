package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/cmdb/backend/domain/model"
	"github.com/cmdb/backend/domain/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// WorkflowService provides domain logic for workflows
type WorkflowService struct {
	workflowRepo repository.WorkflowRepository
	assetRepo    repository.AssetRepository
}

// NewWorkflowService creates a new workflow service
func NewWorkflowService(workflowRepo repository.WorkflowRepository, assetRepo repository.AssetRepository) *WorkflowService {
	return &WorkflowService{
		workflowRepo: workflowRepo,
		assetRepo:    assetRepo,
	}
}

// CreateWorkflow creates a new workflow
func (s *WorkflowService) CreateWorkflow(ctx context.Context, workflowType string, assetID string, requester string, requesterID string, priority string, reason string, data interface{}) (*model.Workflow, error) {
	// Find asset
	asset, err := s.assetRepo.FindByAssetID(ctx, assetID)
	if err != nil {
		return nil, err
	}
	
	// Create workflow
	workflow := model.NewWorkflow(
		model.WorkflowType(workflowType),
		asset.AssetID,
		asset.Name,
		requester,
		requesterID,
		model.WorkflowPriority(priority),
		reason,
		data,
	)
	
	// Generate workflow ID
	workflowID, err := s.workflowRepo.GenerateWorkflowID(ctx)
	if err != nil {
		return nil, err
	}
	workflow.WorkflowID = workflowID
	
	// Save workflow
	if err := s.workflowRepo.Save(ctx, workflow); err != nil {
		return nil, err
	}
	
	return workflow, nil
}

// ApproveWorkflow approves a workflow and executes the associated action
func (s *WorkflowService) ApproveWorkflow(ctx context.Context, workflowID, approverID, approverName, comments string) error {
	objectID, err := primitive.ObjectIDFromHex(workflowID)
	if err != nil {
		return err
	}

	// Find workflow
	workflow, err := s.workflowRepo.FindByID(ctx, objectID)
	if err != nil {
		return err
	}
	
	// Check if workflow is already processed
	if !workflow.IsPending() {
		return errors.New("workflow is already processed")
	}
	
	// Approve workflow
	workflow.Approve(approverID, approverName, comments)
	
	// Save workflow
	if err := s.workflowRepo.Save(ctx, workflow); err != nil {
		return err
	}
	
	// Execute approved action
	return s.executeApprovedAction(ctx, workflow)
}

// RejectWorkflow rejects a workflow
func (s *WorkflowService) RejectWorkflow(ctx context.Context, workflowID, approverID, approverName, comments string) error {
	objectID, err := primitive.ObjectIDFromHex(workflowID)
	if err != nil {
		return err
	}

	// Find workflow
	workflow, err := s.workflowRepo.FindByID(ctx, objectID)
	if err != nil {
		return err
	}
	
	// Check if workflow is already processed
	if !workflow.IsPending() {
		return errors.New("workflow is already processed")
	}
	
	// Reject workflow
	workflow.Reject(approverID, approverName, comments)
	
	// Save workflow
	if err := s.workflowRepo.Save(ctx, workflow); err != nil {
		return err
	}
	
	return nil
}

// HandleFeishuWebhook handles a webhook from Feishu
func (s *WorkflowService) HandleFeishuWebhook(ctx context.Context, workflowID string, status string) error {
	// Find workflow by Feishu ID (workflowID from webhook is actually Feishu ID)
	workflow, err := s.workflowRepo.FindByFeishuID(ctx, workflowID)
	if err != nil {
		return err
	}
	
	// Process based on status
	if status == "approved" {
		return s.ApproveWorkflow(ctx, workflow.ID.Hex(), "feishu-system", "Feishu System", "Approved via Feishu")
	} else if status == "rejected" {
		return s.RejectWorkflow(ctx, workflow.ID.Hex(), "feishu-system", "Feishu System", "Rejected via Feishu")
	}
	
	return nil
}

// GetWorkflowStats gets workflow statistics by status
func (s *WorkflowService) GetWorkflowStats(ctx context.Context) (map[string]int64, error) {
	return s.workflowRepo.GetWorkflowStats(ctx)
}

// GetWorkflowTypeStats gets workflow statistics by type
func (s *WorkflowService) GetWorkflowTypeStats(ctx context.Context) (map[string]int64, error) {
	return s.workflowRepo.GetWorkflowTypeStats(ctx)
}

// GetAssetWorkflowHistory gets workflow history for a specific asset
func (s *WorkflowService) GetAssetWorkflowHistory(ctx context.Context, assetID string) ([]*model.Workflow, error) {
	return s.workflowRepo.FindByAssetID(ctx, assetID)
}

// executeApprovedAction executes the action associated with an approved workflow
func (s *WorkflowService) executeApprovedAction(ctx context.Context, workflow *model.Workflow) error {
	// Find asset
	asset, err := s.assetRepo.FindByAssetID(ctx, workflow.AssetID)
	if err != nil {
		return err
	}
	
	// Execute action based on workflow type
	if workflow.IsAssetOnboarding() {
		// Set asset status to online
		asset.SetStatus(model.OnlineStatus)
	} else if workflow.IsAssetDecommission() {
		// Set asset status to decommissioned
		asset.SetStatus(model.DecommissionedStatus)
	} else if workflow.IsStatusChange() {
		// Toggle asset status between online and offline
		if asset.IsOnline() {
			asset.SetStatus(model.OfflineStatus)
		} else {
			asset.SetStatus(model.OnlineStatus)
		}
	} else if workflow.IsMaintenanceRequest() {
		// Set asset status to maintenance
		asset.SetStatus(model.MaintenanceStatus)
	} else {
		return fmt.Errorf("unknown workflow type: %s", workflow.Type)
	}
	
	// Save asset
	return s.assetRepo.Save(ctx, asset)
}

// SubmitToFeishu submits a workflow to Feishu (simulated)
func (s *WorkflowService) SubmitToFeishu(ctx context.Context, workflow *model.Workflow) (string, error) {
	// Simulate Feishu API call
	// In real implementation, this would make HTTP request to Feishu API
	feishuID := fmt.Sprintf("FEISHU-%d", time.Now().Unix())
	
	// Update workflow with Feishu ID
	workflow.SetFeishuID(feishuID)
	
	// Save workflow
	if err := s.workflowRepo.Save(ctx, workflow); err != nil {
		return "", err
	}
	
	return feishuID, nil
}

// GetWorkflows gets all workflows with optional filtering
func (s *WorkflowService) GetWorkflows(ctx context.Context, filter map[string]interface{}) ([]*model.Workflow, error) {
	return s.workflowRepo.FindAll(ctx, filter)
}

// GetWorkflowByID gets a workflow by its ID
func (s *WorkflowService) GetWorkflowByID(ctx context.Context, id primitive.ObjectID) (*model.Workflow, error) {
	return s.workflowRepo.FindByID(ctx, id)
}

// GetPendingWorkflows gets all pending workflows
func (s *WorkflowService) GetPendingWorkflows(ctx context.Context) ([]*model.Workflow, error) {
	filter := map[string]interface{}{
		"status": model.PendingStatus,
	}
	return s.workflowRepo.FindAll(ctx, filter)
}

// GetUserWorkflows gets workflows created by a specific user
func (s *WorkflowService) GetUserWorkflows(ctx context.Context, userID string) ([]*model.Workflow, error) {
	filter := map[string]interface{}{
		"requesterId": userID,
	}
	return s.workflowRepo.FindAll(ctx, filter)
}
