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

// MongoDBWorkflowRepository implements the WorkflowRepository interface using MongoDB
type MongoDBWorkflowRepository struct {
	collection *mongo.Collection
}

// NewMongoDBWorkflowRepository creates a new MongoDB workflow repository
func NewMongoDBWorkflowRepository(db *mongo.Database) repository.WorkflowRepository {
	collection := db.Collection("workflows")
	
	// Create indexes
	indexModels := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "workflowId", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "feishuId", Value: 1}},
			Options: options.Index().SetUnique(true).SetSparse(true),
		},
		{
			Keys: bson.D{{Key: "assetId", Value: 1}},
		},
	}
	
	_, err := collection.Indexes().CreateMany(context.Background(), indexModels)
	if err != nil {
		// Log error but continue
		fmt.Printf("Error creating workflow indexes: %v\n", err)
	}
	
	return &MongoDBWorkflowRepository{
		collection: collection,
	}
}

// FindByID finds a workflow by its ID
func (r *MongoDBWorkflowRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*model.Workflow, error) {
	var workflow model.Workflow
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&workflow)
	if err != nil {
		return nil, err
	}
	return &workflow, nil
}

// FindByWorkflowID finds a workflow by its workflow ID
func (r *MongoDBWorkflowRepository) FindByWorkflowID(ctx context.Context, workflowID string) (*model.Workflow, error) {
	var workflow model.Workflow
	err := r.collection.FindOne(ctx, bson.M{"workflowId": workflowID}).Decode(&workflow)
	if err != nil {
		return nil, err
	}
	return &workflow, nil
}

// FindByFeishuID finds a workflow by its Feishu ID
func (r *MongoDBWorkflowRepository) FindByFeishuID(ctx context.Context, feishuID string) (*model.Workflow, error) {
	var workflow model.Workflow
	err := r.collection.FindOne(ctx, bson.M{"feishuId": feishuID}).Decode(&workflow)
	if err != nil {
		return nil, err
	}
	return &workflow, nil
}

// FindAll finds all workflows with optional filtering
func (r *MongoDBWorkflowRepository) FindAll(ctx context.Context, filter map[string]interface{}) ([]*model.Workflow, error) {
	// Convert map to bson.M
	bsonFilter := bson.M{}
	for k, v := range filter {
		bsonFilter[k] = v
	}
	
	// Set default sort by createdAt descending
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	
	cursor, err := r.collection.Find(ctx, bsonFilter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	
	var workflows []*model.Workflow
	if err := cursor.All(ctx, &workflows); err != nil {
		return nil, err
	}
	
	return workflows, nil
}

// FindByAssetID finds all workflows for a specific asset
func (r *MongoDBWorkflowRepository) FindByAssetID(ctx context.Context, assetID string) ([]*model.Workflow, error) {
	// Set default sort by createdAt descending
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	
	cursor, err := r.collection.Find(ctx, bson.M{"assetId": assetID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	
	var workflows []*model.Workflow
	if err := cursor.All(ctx, &workflows); err != nil {
		return nil, err
	}
	
	return workflows, nil
}

// Save creates or updates a workflow
func (r *MongoDBWorkflowRepository) Save(ctx context.Context, workflow *model.Workflow) error {
	if workflow.ID.IsZero() {
		// Create new workflow
		workflow.ID = primitive.NewObjectID()
		_, err := r.collection.InsertOne(ctx, workflow)
		return err
	}
	
	// Update existing workflow
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": workflow.ID}, workflow)
	return err
}

// Delete deletes a workflow by its ID
func (r *MongoDBWorkflowRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

// Count counts workflows with optional filtering
func (r *MongoDBWorkflowRepository) Count(ctx context.Context, filter map[string]interface{}) (int64, error) {
	// Convert map to bson.M
	bsonFilter := bson.M{}
	for k, v := range filter {
		bsonFilter[k] = v
	}
	
	return r.collection.CountDocuments(ctx, bsonFilter)
}

// GetWorkflowStats gets workflow statistics by status
func (r *MongoDBWorkflowRepository) GetWorkflowStats(ctx context.Context) (map[string]int64, error) {
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

// GetWorkflowTypeStats gets workflow statistics by type
func (r *MongoDBWorkflowRepository) GetWorkflowTypeStats(ctx context.Context) (map[string]int64, error) {
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
	
	stats := make(map[string]int64)
	
	for _, result := range results {
		workflowType := result["_id"].(string)
		count := result["count"].(int32)
		stats[workflowType] = int64(count)
	}
	
	return stats, nil
}

// GenerateWorkflowID generates a unique workflow ID
func (r *MongoDBWorkflowRepository) GenerateWorkflowID(ctx context.Context) (string, error) {
	return fmt.Sprintf("WF-%d", time.Now().Unix()), nil
}