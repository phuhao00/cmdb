package application

import (
	"context"
	"time"

	"github.com/phuhao00/cmdb/backend/domain/model"
	"github.com/phuhao00/cmdb/backend/domain/service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AssetDTO represents the data transfer object for assets
type AssetDTO struct {
	ID            string    `json:"id"`
	AssetID       string    `json:"assetId"`
	Name          string    `json:"name"`
	Type          string    `json:"type"`
	Status        string    `json:"status"`
	Location      string    `json:"location"`
	Description   string    `json:"description"`
	PurchasePrice float64   `json:"purchasePrice"`
	AnnualCost    float64   `json:"annualCost"`
	Currency      string    `json:"currency"`
	Tags          []string  `json:"tags"`
	Department    string    `json:"department"`
	Owner         string    `json:"owner"`
	IPAddress     string    `json:"ipAddress"`
	LastScanned   time.Time `json:"lastScanned"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// AssetCreateDTO represents the data for creating an asset
type AssetCreateDTO struct {
	Name        string `json:"name" binding:"required"`
	Type        string `json:"type" binding:"required"`
	Location    string `json:"location" binding:"required"`
	Description string `json:"description"`
	Requester   string `json:"requester,omitempty"`
	RequesterID string `json:"requesterId,omitempty"`
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

// AssetHistoryDTO represents the data transfer object for asset history
type AssetHistoryDTO struct {
	ID           string                 `json:"id"`
	AssetID      string                 `json:"assetId"`
	AssetName    string                 `json:"assetName"`
	ChangeType   string                 `json:"changeType"`
	ChangedBy    string                 `json:"changedBy"`
	ChangedByID  string                 `json:"changedById"`
	FieldChanges []model.FieldChange    `json:"fieldChanges"`
	OldValues    map[string]interface{} `json:"oldValues"`
	NewValues    map[string]interface{} `json:"newValues"`
	ChangeReason string                 `json:"changeReason"`
	Timestamp    time.Time              `json:"timestamp"`
}

// AssetApplication provides application services for assets
type AssetApplication struct {
	assetService    *service.AssetService
	workflowService *service.WorkflowService
}

// NewAssetApplication creates a new asset application service
func NewAssetApplication(assetService *service.AssetService, workflowService *service.WorkflowService) *AssetApplication {
	return &AssetApplication{
		assetService:    assetService,
		workflowService: workflowService,
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

// CreateAssetWithApproval creates a new asset with approval workflow
func (a *AssetApplication) CreateAssetWithApproval(ctx context.Context, createDTO AssetCreateDTO) (*AssetDTO, error) {
	// Create workflow for asset creation
	asset, workflow, err := a.assetService.CreateAssetWithApproval(ctx, createDTO.Name, createDTO.Type, createDTO.Location, createDTO.Description, createDTO.Requester, createDTO.RequesterID)
	if err != nil {
		return nil, err
	}

	// Submit to Feishu (optional)
	if a.workflowService != nil {
		_, _ = a.workflowService.SubmitToFeishu(ctx, workflow)
	}

	return mapAssetToDTO(asset), nil
}

// UpdateAssetWithApproval updates an asset with approval workflow
func (a *AssetApplication) UpdateAssetWithApproval(ctx context.Context, id string, updateDTO AssetUpdateDTO) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	// Create workflow for asset update
	workflow, err := a.assetService.CreateAssetUpdateWorkflow(ctx, objectID, updateDTO.Name, updateDTO.Location, updateDTO.Description, updateDTO.Requester, updateDTO.RequesterID)
	if err != nil {
		return err
	}

	// Submit to Feishu (optional)
	if a.workflowService != nil {
		_, _ = a.workflowService.SubmitToFeishu(ctx, workflow)
	}

	return nil
}

// RequestDecommission initiates a decommission workflow for an asset
func (a *AssetApplication) RequestDecommission(ctx context.Context, id string, requester string, requesterID string, reason string) error {
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
		ID:            asset.ID.Hex(),
		AssetID:       asset.AssetID,
		Name:          asset.Name,
		Type:          string(asset.Type),
		Status:        string(asset.Status),
		Location:      asset.Location,
		Description:   asset.Description,
		PurchasePrice: asset.PurchasePrice,
		AnnualCost:    asset.AnnualCost,
		Currency:      asset.Currency,
		Department:    asset.Department,
		Owner:         asset.Owner,
		IPAddress:     asset.IPAddress,
		Tags:          asset.Tags,
		LastScanned:   asset.LastScanned,
		CreatedAt:     asset.CreatedAt,
		UpdatedAt:     asset.UpdatedAt,
	}
}

// AddAssetTags adds tags to an asset
func (a *AssetApplication) AddAssetTags(ctx context.Context, id string, tags []string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	asset, err := a.assetService.GetAssetByID(ctx, objectID)
	if err != nil {
		return err
	}

	for _, tag := range tags {
		asset.AddTag(tag)
	}

	_, err = a.assetService.UpdateAsset(ctx, asset.ID, asset.Name, asset.Location, asset.Description)
	return err
}

// RemoveAssetTag removes a tag from an asset
func (a *AssetApplication) RemoveAssetTag(ctx context.Context, id string, tag string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	asset, err := a.assetService.GetAssetByID(ctx, objectID)
	if err != nil {
		return err
	}

	asset.RemoveTag(tag)

	_, err = a.assetService.UpdateAsset(ctx, asset.ID, asset.Name, asset.Location, asset.Description)
	return err
}

// GetAllTags retrieves all unique tags across all assets
func (a *AssetApplication) GetAllTags(ctx context.Context) ([]string, error) {
	return a.assetService.GetAllTags(ctx)
}

// SearchAssets performs advanced search on assets
func (a *AssetApplication) SearchAssets(ctx context.Context, searchDTO AssetSearchDTO) ([]*model.Asset, int64, error) {
	// Convert DTO to service search criteria
	criteria := service.AssetSearchCriteria{
		Query:      searchDTO.Query,
		Type:       searchDTO.Type,
		Status:     searchDTO.Status,
		Location:   searchDTO.Location,
		Department: searchDTO.Department,
		Owner:      searchDTO.Owner,
		Tags:       searchDTO.Tags,
		IPAddress:  searchDTO.IPAddress,
		SortBy:     searchDTO.SortBy,
		SortOrder:  searchDTO.SortOrder,
		Page:       searchDTO.Page,
		Limit:      searchDTO.Limit,
	}

	assets, err := a.assetService.SearchAssets(ctx, criteria)
	if err != nil {
		return nil, 0, err
	}

	total, err := a.assetService.CountAssets(ctx, criteria)
	if err != nil {
		return nil, 0, err
	}

	return assets, total, nil
}

// GetDepartments retrieves all unique departments
func (a *AssetApplication) GetDepartments(ctx context.Context) ([]string, error) {
	return a.assetService.GetDepartments(ctx)
}

// GetOwners retrieves all unique owners
func (a *AssetApplication) GetOwners(ctx context.Context) ([]string, error) {
	return a.assetService.GetOwners(ctx)
}

// GetAssetHistory gets the history records for a specific asset
func (a *AssetApplication) GetAssetHistory(ctx context.Context, assetID string) ([]*AssetHistoryDTO, error) {
	objectID, err := primitive.ObjectIDFromHex(assetID)
	if err != nil {
		return nil, err
	}

	histories, err := a.assetService.GetAssetHistory(ctx, objectID)
	if err != nil {
		return nil, err
	}

	// Convert to DTOs
	var dtos []*AssetHistoryDTO
	for _, history := range histories {
		dto := &AssetHistoryDTO{
			ID:           history.ID.Hex(),
			AssetID:      history.AssetID.Hex(),
			AssetName:    history.AssetName,
			ChangeType:   history.ChangeType,
			ChangedBy:    history.ChangedBy,
			ChangedByID:  history.ChangedByID,
			FieldChanges: history.FieldChanges,
			OldValues:    history.OldValues,
			NewValues:    history.NewValues,
			ChangeReason: history.ChangeReason,
			Timestamp:    history.Timestamp,
		}
		dtos = append(dtos, dto)
	}

	return dtos, nil
}
