package persistence

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/phuhao00/cmdb/backend/domain/model"
	"github.com/phuhao00/cmdb/backend/domain/repository"
)

// MongoAuditLogRepository implements AuditLogRepository using MongoDB
type MongoAuditLogRepository struct {
	collection *mongo.Collection
}

// NewMongoAuditLogRepository creates a new MongoDB audit log repository
func NewMongoAuditLogRepository(db *mongo.Database) *MongoAuditLogRepository {
	collection := db.Collection("audit_logs")

	// Create indexes for better query performance
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "userId", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "resourceType", Value: 1}, {Key: "resourceId", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "action", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "timestamp", Value: -1}},
		},
		{
			Keys: bson.D{{Key: "username", Value: 1}},
		},
	}

	collection.Indexes().CreateMany(ctx, indexes)

	return &MongoAuditLogRepository{
		collection: collection,
	}
}

// Create adds a new audit log entry
func (r *MongoAuditLogRepository) Create(ctx context.Context, log *model.AuditLog) error {
	if log.ID.IsZero() {
		log.ID = primitive.NewObjectID()
	}

	_, err := r.collection.InsertOne(ctx, log)
	return err
}

// FindByUserID finds all audit logs for a specific user
func (r *MongoAuditLogRepository) FindByUserID(ctx context.Context, userID string, limit int) ([]*model.AuditLog, error) {
	filter := bson.M{"userId": userID}
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(int64(limit))

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var logs []*model.AuditLog
	if err := cursor.All(ctx, &logs); err != nil {
		return nil, err
	}

	return logs, nil
}

// FindByResourceID finds all audit logs for a specific resource
func (r *MongoAuditLogRepository) FindByResourceID(ctx context.Context, resourceType, resourceID string, limit int) ([]*model.AuditLog, error) {
	filter := bson.M{
		"resourceType": resourceType,
		"resourceId":   resourceID,
	}
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(int64(limit))

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var logs []*model.AuditLog
	if err := cursor.All(ctx, &logs); err != nil {
		return nil, err
	}

	return logs, nil
}

// FindByDateRange finds all audit logs within a date range
func (r *MongoAuditLogRepository) FindByDateRange(ctx context.Context, start, end time.Time, limit int) ([]*model.AuditLog, error) {
	filter := bson.M{
		"timestamp": bson.M{
			"$gte": start,
			"$lte": end,
		},
	}
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(int64(limit))

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var logs []*model.AuditLog
	if err := cursor.All(ctx, &logs); err != nil {
		return nil, err
	}

	return logs, nil
}

// FindByAction finds all audit logs for a specific action
func (r *MongoAuditLogRepository) FindByAction(ctx context.Context, action model.AuditAction, limit int) ([]*model.AuditLog, error) {
	filter := bson.M{"action": action}
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(int64(limit))

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var logs []*model.AuditLog
	if err := cursor.All(ctx, &logs); err != nil {
		return nil, err
	}

	return logs, nil
}

// Search performs a comprehensive search across audit logs
func (r *MongoAuditLogRepository) Search(ctx context.Context, criteria repository.AuditLogSearchCriteria) ([]*model.AuditLog, error) {
	filter := bson.M{}

	if criteria.UserID != "" {
		filter["userId"] = criteria.UserID
	}

	if criteria.Username != "" {
		filter["username"] = primitive.Regex{Pattern: criteria.Username, Options: "i"}
	}

	if criteria.Action != "" {
		filter["action"] = criteria.Action
	}

	if criteria.ResourceType != "" {
		filter["resourceType"] = criteria.ResourceType
	}

	if criteria.ResourceID != "" {
		filter["resourceId"] = criteria.ResourceID
	}

	if !criteria.StartDate.IsZero() || !criteria.EndDate.IsZero() {
		timestampFilter := bson.M{}
		if !criteria.StartDate.IsZero() {
			timestampFilter["$gte"] = criteria.StartDate
		}
		if !criteria.EndDate.IsZero() {
			timestampFilter["$lte"] = criteria.EndDate
		}
		filter["timestamp"] = timestampFilter
	}

	if criteria.Success != nil {
		filter["success"] = *criteria.Success
	}

	if criteria.IPAddress != "" {
		filter["ipAddress"] = criteria.IPAddress
	}

	// Set up pagination and sorting
	skip := (criteria.Page - 1) * criteria.Limit
	opts := options.Find().SetSkip(int64(skip)).SetLimit(int64(criteria.Limit))

	// Set sort order
	sortOrder := 1
	if criteria.SortOrder == "desc" {
		sortOrder = -1
	}

	sortBy := "timestamp"
	if criteria.SortBy != "" {
		sortBy = criteria.SortBy
	}

	opts.SetSort(bson.D{{Key: sortBy, Value: sortOrder}})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var logs []*model.AuditLog
	if err := cursor.All(ctx, &logs); err != nil {
		return nil, err
	}

	return logs, nil
}

// Count returns the total number of audit logs matching the criteria
func (r *MongoAuditLogRepository) Count(ctx context.Context, criteria repository.AuditLogSearchCriteria) (int64, error) {
	filter := bson.M{}

	if criteria.UserID != "" {
		filter["userId"] = criteria.UserID
	}

	if criteria.Username != "" {
		filter["username"] = primitive.Regex{Pattern: criteria.Username, Options: "i"}
	}

	if criteria.Action != "" {
		filter["action"] = criteria.Action
	}

	if criteria.ResourceType != "" {
		filter["resourceType"] = criteria.ResourceType
	}

	if criteria.ResourceID != "" {
		filter["resourceId"] = criteria.ResourceID
	}

	if !criteria.StartDate.IsZero() || !criteria.EndDate.IsZero() {
		timestampFilter := bson.M{}
		if !criteria.StartDate.IsZero() {
			timestampFilter["$gte"] = criteria.StartDate
		}
		if !criteria.EndDate.IsZero() {
			timestampFilter["$lte"] = criteria.EndDate
		}
		filter["timestamp"] = timestampFilter
	}

	if criteria.Success != nil {
		filter["success"] = *criteria.Success
	}

	if criteria.IPAddress != "" {
		filter["ipAddress"] = criteria.IPAddress
	}

	return r.collection.CountDocuments(ctx, filter)
}

// DeleteOlderThan deletes audit logs older than the specified time
func (r *MongoAuditLogRepository) DeleteOlderThan(ctx context.Context, timestamp time.Time) error {
	filter := bson.M{
		"timestamp": bson.M{
			"$lt": timestamp,
		},
	}

	_, err := r.collection.DeleteMany(ctx, filter)
	return err
}
