package service

import (
	"context"
	"errors"

	"github.com/phuhao00/cmdb/backend/domain/model"
	"github.com/phuhao00/cmdb/backend/domain/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AssetService provides domain logic for assets
type AssetService struct {
	assetRepo        repository.AssetRepository
	workflowRepo     repository.WorkflowRepository
	assetHistoryRepo repository.AssetHistoryRepository
}

// NewAssetService creates a new asset service
func NewAssetService(assetRepo repository.AssetRepository, workflowRepo repository.WorkflowRepository, assetHistoryRepo repository.AssetHistoryRepository) *AssetService {
	return &AssetService{
		assetRepo:        assetRepo,
		workflowRepo:     workflowRepo,
		assetHistoryRepo: assetHistoryRepo,
	}
}

// CreateAsset creates a new asset and initiates an onboarding workflow
func (s *AssetService) CreateAsset(ctx context.Context, name string, assetType string, location string, description string) (*model.Asset, *model.Workflow, error) {
	// Create new asset
	asset := model.NewAsset(name, model.AssetType(assetType), location, description)

	// Generate asset ID
	assetID, err := s.assetRepo.GenerateAssetID(ctx, string(asset.Type))
	if err != nil {
		return nil, nil, err
	}
	asset.AssetID = assetID

	// Save asset
	if err := s.assetRepo.Save(ctx, asset); err != nil {
		return nil, nil, err
	}

	// Create onboarding workflow
	workflow := model.NewWorkflow(
		model.AssetOnboardingType,
		asset.AssetID,
		asset.Name,
		"System User",
		"system",
		model.MediumPriority,
		"New asset registration",
		asset,
	)

	// Generate workflow ID
	workflowID, err := s.workflowRepo.GenerateWorkflowID(ctx)
	if err != nil {
		return nil, nil, err
	}
	workflow.WorkflowID = workflowID

	// Save workflow
	if err := s.workflowRepo.Save(ctx, workflow); err != nil {
		return nil, nil, err
	}

	return asset, workflow, nil
}

// UpdateAsset updates an existing asset
func (s *AssetService) UpdateAsset(ctx context.Context, id primitive.ObjectID, name string, location string, description string) (*model.Asset, error) {
	// Find asset
	asset, err := s.assetRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Update asset
	asset.Update(name, location, description)

	// Save asset
	if err := s.assetRepo.Save(ctx, asset); err != nil {
		return nil, err
	}

	return asset, nil
}

// RequestDecommission initiates a decommission workflow for an asset
func (s *AssetService) RequestDecommission(ctx context.Context, id primitive.ObjectID, requester string, reason string) (*model.Workflow, error) {
	// Find asset
	asset, err := s.assetRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Check if asset is already decommissioned
	if asset.IsDecommissioned() {
		return nil, errors.New("asset is already decommissioned")
	}

	// Create decommission workflow
	workflow := model.NewWorkflow(
		model.AssetDecommissionType,
		asset.AssetID,
		asset.Name,
		requester,
		"user",
		model.MediumPriority,
		reason,
		asset,
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

// RequestStatusChange initiates a status change workflow for an asset
func (s *AssetService) RequestStatusChange(ctx context.Context, id primitive.ObjectID, requester string, reason string) (*model.Workflow, error) {
	// Find asset
	asset, err := s.assetRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Check if asset is decommissioned
	if asset.IsDecommissioned() {
		return nil, errors.New("cannot change status of decommissioned asset")
	}

	// Create status change workflow
	workflow := model.NewWorkflow(
		model.StatusChangeType,
		asset.AssetID,
		asset.Name,
		requester,
		"user",
		model.MediumPriority,
		reason,
		map[string]interface{}{
			"oldStatus":       asset.Status,
			"requestedAction": "status_change",
		},
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

// RequestMaintenance initiates a maintenance workflow for an asset
func (s *AssetService) RequestMaintenance(ctx context.Context, id primitive.ObjectID, requester string, reason string) (*model.Workflow, error) {
	// Find asset
	asset, err := s.assetRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Check if asset is decommissioned
	if asset.IsDecommissioned() {
		return nil, errors.New("cannot request maintenance for decommissioned asset")
	}

	// Check if asset is already in maintenance
	if asset.IsInMaintenance() {
		return nil, errors.New("asset is already in maintenance")
	}

	// Create maintenance workflow
	workflow := model.NewWorkflow(
		model.MaintenanceRequestType,
		asset.AssetID,
		asset.Name,
		requester,
		"user",
		model.MediumPriority,
		reason,
		asset,
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

// BulkCreateAssets creates multiple assets and initiates onboarding workflows
func (s *AssetService) BulkCreateAssets(ctx context.Context, assets []model.Asset) (int, error) {
	successCount := 0

	for i := range assets {
		// Generate asset ID
		assetID, err := s.assetRepo.GenerateAssetID(ctx, string(assets[i].Type))
		if err != nil {
			continue
		}
		assets[i].AssetID = assetID

		// Save asset
		if err := s.assetRepo.Save(ctx, &assets[i]); err != nil {
			continue
		}

		// Create onboarding workflow
		workflow := model.NewWorkflow(
			model.AssetOnboardingType,
			assets[i].AssetID,
			assets[i].Name,
			"System User",
			"system",
			model.MediumPriority,
			"Bulk asset registration",
			&assets[i],
		)

		// Generate workflow ID
		workflowID, err := s.workflowRepo.GenerateWorkflowID(ctx)
		if err != nil {
			continue
		}
		workflow.WorkflowID = workflowID

		// Save workflow
		if err := s.workflowRepo.Save(ctx, workflow); err != nil {
			continue
		}

		successCount++
	}

	return successCount, nil
}

// GetAssetStats gets asset statistics
func (s *AssetService) GetAssetStats(ctx context.Context) (map[string]int64, error) {
	return s.assetRepo.GetAssetStats(ctx)
}

// GetAssetTypes gets asset types with counts
func (s *AssetService) GetAssetTypes(ctx context.Context) (map[string]int64, error) {
	return s.assetRepo.GetAssetTypes(ctx)
}

// GetAssetLocations gets asset locations with counts
func (s *AssetService) GetAssetLocations(ctx context.Context) (map[string]int64, error) {
	return s.assetRepo.GetAssetLocations(ctx)
}

// GetAssets gets all assets with optional filtering
func (s *AssetService) GetAssets(ctx context.Context, filter map[string]interface{}) ([]*model.Asset, error) {
	return s.assetRepo.FindAll(ctx, filter)
}

// GetAssetByID gets an asset by its ID
func (s *AssetService) GetAssetByID(ctx context.Context, id primitive.ObjectID) (*model.Asset, error) {
	return s.assetRepo.FindByID(ctx, id)
}

// CreateAssetWithApproval creates a new asset with approval workflow
func (s *AssetService) CreateAssetWithApproval(ctx context.Context, name string, assetType string, location string, description string, requester string, requesterID string) (*model.Asset, *model.Workflow, error) {
	// Create new asset
	asset := model.NewAsset(name, model.AssetType(assetType), location, description)

	// Generate asset ID
	assetID, err := s.assetRepo.GenerateAssetID(ctx, string(asset.Type))
	if err != nil {
		return nil, nil, err
	}
	asset.AssetID = assetID

	// Save asset
	if err := s.assetRepo.Save(ctx, asset); err != nil {
		return nil, nil, err
	}

	// Create onboarding workflow
	workflow := model.NewWorkflow(
		model.AssetOnboardingType,
		asset.AssetID,
		asset.Name,
		requester,
		requesterID,
		model.MediumPriority,
		"Asset creation approval",
		asset,
	)

	// Generate workflow ID
	workflowID, err := s.workflowRepo.GenerateWorkflowID(ctx)
	if err != nil {
		return nil, nil, err
	}
	workflow.WorkflowID = workflowID

	// Save workflow
	if err := s.workflowRepo.Save(ctx, workflow); err != nil {
		return nil, nil, err
	}

	return asset, workflow, nil
}

// CreateAssetUpdateWorkflow creates an update workflow for an asset
func (s *AssetService) CreateAssetUpdateWorkflow(ctx context.Context, id primitive.ObjectID, name string, location string, description string, requester string, requesterID string) (*model.Workflow, error) {
	// Find asset
	asset, err := s.assetRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Create update data
	updateData := map[string]interface{}{
		"originalName":        asset.Name,
		"originalLocation":    asset.Location,
		"originalDescription": asset.Description,
		"newName":             name,
		"newLocation":         location,
		"newDescription":      description,
	}

	// Create update workflow
	workflow := model.NewWorkflow(
		model.AssetUpdateType,
		asset.AssetID,
		asset.Name,
		requester,
		requesterID,
		model.MediumPriority,
		"Asset update approval",
		updateData,
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

// GetAssetHistory gets the history records for a specific asset
func (s *AssetService) GetAssetHistory(ctx context.Context, assetID primitive.ObjectID) ([]*model.AssetHistory, error) {
	return s.assetHistoryRepo.FindByAssetID(ctx, assetID, 100) // Limit to 100 most recent records
}
