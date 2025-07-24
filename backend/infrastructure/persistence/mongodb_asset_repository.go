package persistence

import (
	"context"
	"fmt"
	"time"

	"github.com/cmdb/backend/domain/model"
	"github.com/cmdb/backend/domain/repository"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MongoDBAssetRepository implements the AssetRepository interface using MongoDB
type MongoDBAssetRepository struct {
	collection *mongo.Collection
}

// NewMongoDBAssetRepository creates a new MongoDB asset repository
func NewMongoDBAssetRepository(db *mongo.Database) repository.AssetRepository {
	collection := db.Collection("assets")
	
	// Create indexes
	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "assetId", Value: 1}},
		Options: options.Index().SetUnique(true),
	}
	
	_, err := collection.Indexes().CreateOne(context.Background(), indexModel)
	if err != nil {
		// Log error but continue
		fmt.Printf("Error creating asset index: %v\n", err)
	}
	
	return &MongoDBAssetRepository{
		collection: collection,
	}
}

// FindByID finds an asset by its ID
func (r *MongoDBAssetRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*model.Asset, error) {
	var asset model.Asset
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&asset)
	if err != nil {
		return nil, err
	}
	return &asset, nil
}

// FindByAssetID finds an asset by its asset ID
func (r *MongoDBAssetRepository) FindByAssetID(ctx context.Context, assetID string) (*model.Asset, error) {
	var asset model.Asset
	err := r.collection.FindOne(ctx, bson.M{"assetId": assetID}).Decode(&asset)
	if err != nil {
		return nil, err
	}
	return &asset, nil
}

// FindAll finds all assets with optional filtering
func (r *MongoDBAssetRepository) FindAll(ctx context.Context, filter map[string]interface{}) ([]*model.Asset, error) {
	// Convert map to bson.M
	bsonFilter := bson.M{}
	for k, v := range filter {
		bsonFilter[k] = v
	}
	
	// Handle special filters
	if search, ok := filter["search"].(string); ok {
		delete(bsonFilter, "search")
		bsonFilter["$or"] = []bson.M{
			{"name": bson.M{"$regex": search, "$options": "i"}},
			{"assetId": bson.M{"$regex": search, "$options": "i"}},
			{"location": bson.M{"$regex": search, "$options": "i"}},
			{"description": bson.M{"$regex": search, "$options": "i"}},
		}
	}
	
	if fromDate, ok := filter["fromDate"].(time.Time); ok {
		delete(bsonFilter, "fromDate")
		bsonFilter["createdAt"] = bson.M{"$gte": fromDate}
	}
	
	if toDate, ok := filter["toDate"].(time.Time); ok {
		delete(bsonFilter, "toDate")
		if _, exists := bsonFilter["createdAt"]; exists {
			bsonFilter["createdAt"].(bson.M)["$lte"] = toDate
		} else {
			bsonFilter["createdAt"] = bson.M{"$lte": toDate}
		}
	}
	
	cursor, err := r.collection.Find(ctx, bsonFilter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	
	var assets []*model.Asset
	if err := cursor.All(ctx, &assets); err != nil {
		return nil, err
	}
	
	return assets, nil
}

// Save creates or updates an asset
func (r *MongoDBAssetRepository) Save(ctx context.Context, asset *model.Asset) error {
	if asset.ID.IsZero() {
		// Create new asset
		asset.ID = primitive.NewObjectID()
		_, err := r.collection.InsertOne(ctx, asset)
		return err
	}
	
	// Update existing asset
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": asset.ID}, asset)
	return err
}

// Delete deletes an asset by its ID
func (r *MongoDBAssetRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

// Count counts assets with optional filtering
func (r *MongoDBAssetRepository) Count(ctx context.Context, filter map[string]interface{}) (int64, error) {
	// Convert map to bson.M
	bsonFilter := bson.M{}
	for k, v := range filter {
		bsonFilter[k] = v
	}
	
	return r.collection.CountDocuments(ctx, bsonFilter)
}

// GetAssetTypes gets all asset types with counts
func (r *MongoDBAssetRepository) GetAssetTypes(ctx context.Context) (map[string]int64, error) {
	pipeline := []bson.M{
		{
			"$group": bson.M{
				"_id":   "$type",
				"count": bson.M{"$sum": 1},
			},
		},
	}
	
	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	
	var results []bson.M
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	
	types := make(map[string]int64)
	for _, result := range results {
		assetType := result["_id"].(string)
		count := result["count"].(int32)
		types[assetType] = int64(count)
	}
	
	return types, nil
}

// GetAssetLocations gets all asset locations with counts
func (r *MongoDBAssetRepository) GetAssetLocations(ctx context.Context) (map[string]int64, error) {
	pipeline := []bson.M{
		{
			"$group": bson.M{
				"_id":   "$location",
				"count": bson.M{"$sum": 1},
			},
		},
	}
	
	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	
	var results []bson.M
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	
	locations := make(map[string]int64)
	for _, result := range results {
		location := result["_id"].(string)
		count := result["count"].(int32)
		locations[location] = int64(count)
	}
	
	return locations, nil
}

// GetAssetStats gets asset statistics by status
func (r *MongoDBAssetRepository) GetAssetStats(ctx context.Context) (map[string]int64, error) {
	pipeline := []bson.M{
		{
			"$group": bson.M{
				"_id":   "$status",
				"count": bson.M{"$sum": 1},
			},
		},
	}
	
	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	
	var results []bson.M
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	
	stats := make(map[string]int64)
	var total int64 = 0
	
	for _, result := range results {
		status := result["_id"].(string)
		count := result["count"].(int32)
		stats[status] = int64(count)
		total += int64(count)
	}
	
	stats["total"] = total
	
	return stats, nil
}

// GenerateAssetID generates a unique asset ID based on type
func (r *MongoDBAssetRepository) GenerateAssetID(ctx context.Context, assetType string) (string, error) {
	prefix := map[string]string{
		"server":      "SRV",
		"network":     "NET",
		"storage":     "STG",
		"workstation": "WS",
	}
	
	typePrefix := prefix[assetType]
	if typePrefix == "" {
		typePrefix = "AST"
	}
	
	// Get count of assets of this type
	count, err := r.collection.CountDocuments(ctx, bson.M{"type": assetType})
	if err != nil {
		return "", err
	}
	
	return fmt.Sprintf("%s-%03d", typePrefix, count+1), nil
}