package persistence

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/yourusername/cmdb/backend/domain/model"
	"github.com/yourusername/cmdb/backend/domain/repository"
)

// MongoAssetHistoryRepository implements AssetHistoryRepository using MongoDB
type MongoAssetHistoryRepository struct {
	collection *mongo.Collection
}

// NewMongoAssetHistoryRepository creates a new MongoDB asset history repository
func NewMongoAssetHistoryRepository(db *mongo.Database) *MongoAssetHistoryRepository {
	collection := db.Collection("asset_history")
	
	// Create indexes for better query performance
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "assetId", Value: 1}, {Key: "timestamp", Value: -1}},
		},
		{
			Keys: bson.D{{Key: "changedById", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "changeType", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "timestamp", Value: -1}},
		},
	}
	
	collection.Indexes().CreateMany(ctx, indexes)
	
	return &MongoAssetHistoryRepository{
		collection: collection,
	}
}

// Create adds a new asset history record
func (r *MongoAssetHistoryRepository) Create(ctx context.Context, history *model.AssetHistory) error {
	if history.ID.IsZero() {
		history.ID = primitive.NewObjectID()
	}
	
	_, err := r.collection.InsertOne(ctx, history)
	return err
}

// FindByAssetID finds all history records for a specific asset
func (r *MongoAssetHistoryRepository) FindByAssetID(ctx context.Context, assetID primitive.ObjectID, limit int) ([]*model.AssetHistory, error) {
	filter := bson.M{"assetId": assetID}
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}})
	
	if limit > 0 {
		opts.SetLimit(int64(limit))
	}
	
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	
	var histories []*model.AssetHistory
	if err := cursor.All(ctx, &histories); err != nil {
		return nil, err
	}
	
	return histories, nil
}

// FindByDateRange finds history records within a date range
func (r *MongoAssetHistoryRepository) FindByDateRange(ctx context.Context, assetID primitive.ObjectID, start, end time.Time) ([]*model.AssetHistory, error) {
	filter := bson.M{
		"assetId": assetID,
		"timestamp": bson.M{
			"$gte": start,
			"$lte": end,
		},
	}
	
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}})
	
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	
	var histories []*model.AssetHistory
	if err := cursor.All(ctx, &histories); err != nil {
		return nil, err
	}
	
	return histories, nil
}

// FindByChangeType finds history records by change type
func (r *MongoAssetHistoryRepository) FindByChangeType(ctx context.Context, assetID primitive.ObjectID, changeType string) ([]*model.AssetHistory, error) {
	filter := bson.M{
		"assetId":    assetID,
		"changeType": changeType,
	}
	
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}})
	
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	
	var histories []*model.AssetHistory
	if err := cursor.All(ctx, &histories); err != nil {
		return nil, err
	}
	
	return histories, nil
}

// FindByUser finds history records by user
func (r *MongoAssetHistoryRepository) FindByUser(ctx context.Context, userID string, limit int) ([]*model.AssetHistory, error) {
	filter := bson.M{"changedById": userID}
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}})
	
	if limit > 0 {
		opts.SetLimit(int64(limit))
	}
	
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	
	var histories []*model.AssetHistory
	if err := cursor.All(ctx, &histories); err != nil {
		return nil, err
	}
	
	return histories, nil
}

// GetLatestChange gets the most recent change for an asset
func (r *MongoAssetHistoryRepository) GetLatestChange(ctx context.Context, assetID primitive.ObjectID) (*model.AssetHistory, error) {
	filter := bson.M{"assetId": assetID}
	opts := options.FindOne().SetSort(bson.D{{Key: "timestamp", Value: -1}})
	
	var history model.AssetHistory
	err := r.collection.FindOne(ctx, filter, opts).Decode(&history)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	
	return &history, nil
}

// CountChanges counts the number of changes for an asset
func (r *MongoAssetHistoryRepository) CountChanges(ctx context.Context, assetID primitive.ObjectID) (int64, error) {
	filter := bson.M{"assetId": assetID}
	return r.collection.CountDocuments(ctx, filter)
}

// DeleteOlderThan deletes history records older than the specified time
func (r *MongoAssetHistoryRepository) DeleteOlderThan(ctx context.Context, timestamp time.Time) error {
	filter := bson.M{
		"timestamp": bson.M{
			"$lt": timestamp,
		},
	}
	
	_, err := r.collection.DeleteMany(ctx, filter)
	return err
}