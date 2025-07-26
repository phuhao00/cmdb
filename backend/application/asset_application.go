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

// AssetUpdateCostsDTO represents the data for updating asset costs
type AssetUpdateCostsDTO struct {
	PurchasePrice float64 `json:"purchasePrice"`
	AnnualCost    float64 `json:"annualCost"`
	Currency      string  `json:"currency"`
}

// AssetCostsDTO represents the cost summary data
type AssetCostsDTO struct {
	TotalInvestment float64 `json:"totalInvestment"`
	AnnualCost      float64 `json:"annualCost"`
	Servers         float64 `json:"servers"`
	Network         float64 `json:"network"`
	Storage         float64 `json:"storage"`
	Workstations    float64 `json:"workstations"`
}

// CriticalAssetDTO represents a critical asset for display
type CriticalAssetDTO struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Type   string `json:"type"`
	Status string `json:"status"`
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

// GetAssetCosts gets asset cost summary
func (a *AssetApplication) GetAssetCosts(ctx context.Context) (*AssetCostsDTO, error) {
	assets, err := a.assetService.GetAssets(ctx, make(map[string]interface{}))
	if err != nil {
		return nil, err
	}
	
	costs := &AssetCostsDTO{}
	
	for _, asset := range assets {
		// Add to total investment and annual cost
		costs.TotalInvestment += asset.PurchasePrice
		costs.AnnualCost += asset.AnnualCost
		
		// Add to category-specific costs
		switch asset.Type {
		case model.ServerType:
			costs.Servers += asset.AnnualCost
		case model.NetworkType:
			costs.Network += asset.AnnualCost
		case model.StorageType:
			costs.Storage += asset.AnnualCost
		case model.WorkstationType:
			costs.Workstations += asset.AnnualCost
		}
	}
	
	return costs, nil
}

// GetCriticalAssets gets critical assets (online servers)
func (a *AssetApplication) GetCriticalAssets(ctx context.Context) ([]*CriticalAssetDTO, error) {
	// Filter for online servers
	filter := map[string]interface{}{
		"status": model.OnlineStatus,
		"type":   model.ServerType,
	}
	
	assets, err := a.assetService.GetAssets(ctx, filter)
	if err != nil {
		return nil, err
	}
	
	criticalAssets := make([]*CriticalAssetDTO, len(assets))
	for i, asset := range assets {
		criticalAssets[i] = &CriticalAssetDTO{
			ID:     asset.ID.Hex(),
			Name:   asset.Name,
			Type:   string(asset.Type),
			Status: string(asset.Status),
		}
	}
	
	return criticalAssets, nil
}

// UpdateAssetCosts updates the costs for an asset
func (a *AssetApplication) UpdateAssetCosts(ctx context.Context, id string, costsDTO AssetUpdateCostsDTO) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	
	asset, err := a.assetService.GetAssetByID(ctx, objectID)
	if err != nil {
		return err
	}
	
	// Update the asset costs
	asset.UpdateCosts(costsDTO.PurchasePrice, costsDTO.AnnualCost, costsDTO.Currency)
	
	// Save the updated asset by calling the service method with correct parameters
	_, err = a.assetService.UpdateAsset(ctx, asset.ID, asset.Name, asset.Location, asset.Description)
	return err
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