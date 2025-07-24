package application

import (
	"context"
	"time"

	"github.com/cmdb/backend/domain/model"
	"github.com/cmdb/backend/domain/service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AssetDTO represents the data transfer object for assets
type AssetDTO struct {
	ID          string    `json:"id"`
	AssetID     string    `json:"assetId"`
	Name        string    `json:"name"`
	Type        string    `json:"type"`
	Status      string    `json:"status"`
	Location    string    `json:"location"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// AssetCreateDTO represents the data for creating an asset
type AssetCreateDTO struct {
	Name        string `json:"name" binding:"required"`
	Type        string `json:"type" binding:"required"`
	Location    string `json:"location" binding:"required"`
	Description string `json:"description"`
}

// AssetUpdateDTO represents the data for updating an asset
type AssetUpdateDTO struct {
	Name        string `json:"name"`
	Location    string `json:"location"`
	Description string `json:"description"`
}

// AssetFilterDTO represents the filter criteria for assets
type AssetFilterDTO struct {
	Status   string    `form:"status"`
	Type     string    `form:"type"`
	Search   string    `form:"search"`
	FromDate time.Time `form:"fromDate"`
	ToDate   time.Time `form:"toDate"`
}

// AssetApplication provides application services for assets
type AssetApplication struct {
	assetService *service.AssetService
}

// NewAssetApplication creates a new asset application service
func NewAssetApplication(assetService *service.AssetService) *AssetApplication {
	return &AssetApplication{
		assetService: assetService,
	}
}

// GetAssetByID gets an asset by ID
func (a *AssetApplication) GetAssetByID(ctx context.Context, id string) (*AssetDTO, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	
	asset, err := a.assetService.GetAssetByID(ctx, objectID)
	if err != nil {
		return nil, err
	}
	
	return mapAssetToDTO(asset), nil
}

// GetAssets gets assets with optional filtering
func (a *AssetApplication) GetAssets(ctx context.Context, filter AssetFilterDTO) ([]*AssetDTO, error) {
	// Convert filter to map
	filterMap := make(map[string]interface{})
	
	if filter.Status != "" {
		filterMap["status"] = filter.Status
	}
	
	if filter.Type != "" {
		filterMap["type"] = filter.Type
	}
	
	if filter.Search != "" {
		filterMap["search"] = filter.Search
	}
	
	if !filter.FromDate.IsZero() {
		filterMap["fromDate"] = filter.FromDate
	}
	
	if !filter.ToDate.IsZero() {
		filterMap["toDate"] = filter.ToDate
	}
	
	assets, err := a.assetService.GetAssets(ctx, filterMap)
	if err != nil {
		return nil, err
	}
	
	// Map assets to DTOs
	assetDTOs := make([]*AssetDTO, len(assets))
	for i, asset := range assets {
		assetDTOs[i] = mapAssetToDTO(asset)
	}
	
	return assetDTOs, nil
}

// CreateAsset creates a new asset
func (a *AssetApplication) CreateAsset(ctx context.Context, createDTO AssetCreateDTO) (*AssetDTO, error) {
	asset, _, err := a.assetService.CreateAsset(ctx, createDTO.Name, createDTO.Type, createDTO.Location, createDTO.Description)
	if err != nil {
		return nil, err
	}
	
	return mapAssetToDTO(asset), nil
}

// UpdateAsset updates an existing asset
func (a *AssetApplication) UpdateAsset(ctx context.Context, id string, updateDTO AssetUpdateDTO) (*AssetDTO, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	
	asset, err := a.assetService.UpdateAsset(ctx, objectID, updateDTO.Name, updateDTO.Location, updateDTO.Description)
	if err != nil {
		return nil, err
	}
	
	return mapAssetToDTO(asset), nil
}

// RequestDecommission initiates a decommission workflow for an asset
func (a *AssetApplication) RequestDecommission(ctx context.Context, id string, requester string, reason string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	
	_, err = a.assetService.RequestDecommission(ctx, objectID, requester, reason)
	return err
}

// RequestStatusChange initiates a status change workflow for an asset
func (a *AssetApplication) RequestStatusChange(ctx context.Context, id string, requester string, reason string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	
	_, err = a.assetService.RequestStatusChange(ctx, objectID, requester, reason)
	return err
}

// RequestMaintenance initiates a maintenance workflow for an asset
func (a *AssetApplication) RequestMaintenance(ctx context.Context, id string, requester string, reason string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	
	_, err = a.assetService.RequestMaintenance(ctx, objectID, requester, reason)
	return err
}

// BulkCreateAssets creates multiple assets
func (a *AssetApplication) BulkCreateAssets(ctx context.Context, createDTOs []AssetCreateDTO) (int, error) {
	assets := make([]model.Asset, len(createDTOs))
	
	for i, dto := range createDTOs {
		assets[i] = *model.NewAsset(dto.Name, model.AssetType(dto.Type), dto.Location, dto.Description)
	}
	
	return a.assetService.BulkCreateAssets(ctx, assets)
}

// GetAssetStats gets asset statistics
func (a *AssetApplication) GetAssetStats(ctx context.Context) (map[string]int64, error) {
	return a.assetService.GetAssetStats(ctx)
}

// GetAssetTypes gets asset types with counts
func (a *AssetApplication) GetAssetTypes(ctx context.Context) (map[string]int64, error) {
	return a.assetService.GetAssetTypes(ctx)
}

// GetAssetLocations gets asset locations with counts
func (a *AssetApplication) GetAssetLocations(ctx context.Context) (map[string]int64, error) {
	return a.assetService.GetAssetLocations(ctx)
}

// Helper function to map an asset to a DTO
func mapAssetToDTO(asset *model.Asset) *AssetDTO {
	return &AssetDTO{
		ID:          asset.ID.Hex(),
		AssetID:     asset.AssetID,
		Name:        asset.Name,
		Type:        string(asset.Type),
		Status:      string(asset.Status),
		Location:    asset.Location,
		Description: asset.Description,
		CreatedAt:   asset.CreatedAt,
		UpdatedAt:   asset.UpdatedAt,
	}
}