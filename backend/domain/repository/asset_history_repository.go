package repository

import (
	"context"
	"time"

	"github.com/yourusername/cmdb/backend/domain/model"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AssetHistoryRepository defines the interface for asset history persistence
type AssetHistoryRepository interface {
	// Create adds a new asset history record
	Create(ctx context.Context, history *model.AssetHistory) error
	
	// FindByAssetID finds all history records for a specific asset
	FindByAssetID(ctx context.Context, assetID primitive.ObjectID, limit int) ([]*model.AssetHistory, error)
	
	// FindByDateRange finds history records within a date range
	FindByDateRange(ctx context.Context, assetID primitive.ObjectID, start, end time.Time) ([]*model.AssetHistory, error)
	
	// FindByChangeType finds history records by change type
	FindByChangeType(ctx context.Context, assetID primitive.ObjectID, changeType string) ([]*model.AssetHistory, error)
	
	// FindByUser finds history records by user
	FindByUser(ctx context.Context, userID string, limit int) ([]*model.AssetHistory, error)
	
	// GetLatestChange gets the most recent change for an asset
	GetLatestChange(ctx context.Context, assetID primitive.ObjectID) (*model.AssetHistory, error)
	
	// CountChanges counts the number of changes for an asset
	CountChanges(ctx context.Context, assetID primitive.ObjectID) (int64, error)
	
	// DeleteOlderThan deletes history records older than the specified time
	DeleteOlderThan(ctx context.Context, timestamp time.Time) error
}