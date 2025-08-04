package repository

import (
	"context"

	"github.com/phuhao00/cmdb/backend/domain/model"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// WorkflowRepository defines the interface for workflow data access
type WorkflowRepository interface {
	// FindByID finds a workflow by its ID
	FindByID(ctx context.Context, id primitive.ObjectID) (*model.Workflow, error)

	// FindByWorkflowID finds a workflow by its workflow ID
	FindByWorkflowID(ctx context.Context, workflowID string) (*model.Workflow, error)

	// FindByFeishuID finds a workflow by its Feishu ID
	FindByFeishuID(ctx context.Context, feishuID string) (*model.Workflow, error)

	// FindAll finds all workflows with optional filtering
	FindAll(ctx context.Context, filter map[string]interface{}) ([]*model.Workflow, error)

	// FindByAssetID finds all workflows for a specific asset
	FindByAssetID(ctx context.Context, assetID string) ([]*model.Workflow, error)

	// Save creates or updates a workflow
	Save(ctx context.Context, workflow *model.Workflow) error

	// Delete deletes a workflow by its ID
	Delete(ctx context.Context, id primitive.ObjectID) error

	// Count counts workflows with optional filtering
	Count(ctx context.Context, filter map[string]interface{}) (int64, error)

	// GetWorkflowStats gets workflow statistics by status
	GetWorkflowStats(ctx context.Context) (map[string]int64, error)

	// GetWorkflowTypeStats gets workflow statistics by type
	GetWorkflowTypeStats(ctx context.Context) (map[string]int64, error)

	// GenerateWorkflowID generates a unique workflow ID
	GenerateWorkflowID(ctx context.Context) (string, error)
}
