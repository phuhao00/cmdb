package repository

import (
	"context"

	"github.com/phuhao00/cmdb/backend/domain/model"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AssetRepository defines the interface for asset data access
type AssetRepository interface {
	// FindByID finds an asset by its ID
	FindByID(ctx context.Context, id primitive.ObjectID) (*model.Asset, error)

	// FindByAssetID finds an asset by its asset ID
	FindByAssetID(ctx context.Context, assetID string) (*model.Asset, error)

	// FindAll finds all assets with optional filtering
	FindAll(ctx context.Context, filter map[string]interface{}) ([]*model.Asset, error)

	// Save creates or updates an asset
	Save(ctx context.Context, asset *model.Asset) error

	// Delete deletes an asset by its ID
	Delete(ctx context.Context, id primitive.ObjectID) error

	// Count counts assets with optional filtering
	Count(ctx context.Context, filter map[string]interface{}) (int64, error)

	// GetAssetTypes gets all asset types with counts
	GetAssetTypes(ctx context.Context) (map[string]int64, error)

	// GetAssetLocations gets all asset locations with counts
	GetAssetLocations(ctx context.Context) (map[string]int64, error)

	// GetAssetStats gets asset statistics by status
	GetAssetStats(ctx context.Context) (map[string]int64, error)

	// GenerateAssetID generates a unique asset ID based on type
	GenerateAssetID(ctx context.Context, assetType string) (string, error)
}
