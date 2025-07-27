package persistence

import (
	"context"
	"time"

	"github.com/cmdb/backend/domain/model"
	"github.com/cmdb/backend/domain/repository"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MongoDBUserRepository implements the UserRepository interface using MongoDB
type MongoDBUserRepository struct {
	database        *mongo.Database
	userCollection  *mongo.Collection
	sessionCollection *mongo.Collection
}

// NewMongoDBUserRepository creates a new MongoDB user repository
func NewMongoDBUserRepository(database *mongo.Database) repository.UserRepository {
	userCollection := database.Collection("users")
	sessionCollection := database.Collection("sessions")
	
	// Create indexes
	_, _ = userCollection.Indexes().CreateMany(context.Background(), []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "username", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
	})
	
	_, _ = sessionCollection.Indexes().CreateMany(context.Background(), []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "token", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{{Key: "expiresAt", Value: 1}},
			Options: options.Index().SetExpireAfterSeconds(0),
		},
	})

	return &MongoDBUserRepository{
		database:          database,
		userCollection:    userCollection,
		sessionCollection: sessionCollection,
	}
}

// Create creates a new user
func (r *MongoDBUserRepository) Create(ctx context.Context, user *model.User) error {
	result, err := r.userCollection.InsertOne(ctx, user)
	if err != nil {
		return err
	}
	user.ID = result.InsertedID.(primitive.ObjectID)
	return nil
}

// GetByID retrieves a user by ID
func (r *MongoDBUserRepository) GetByID(ctx context.Context, id primitive.ObjectID) (*model.User, error) {
	var user model.User
	err := r.userCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// GetByUsername retrieves a user by username
func (r *MongoDBUserRepository) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	var user model.User
	err := r.userCollection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// GetByEmail retrieves a user by email
func (r *MongoDBUserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	err := r.userCollection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// Update updates a user
func (r *MongoDBUserRepository) Update(ctx context.Context, user *model.User) error {
	user.UpdatedAt = time.Now()
	_, err := r.userCollection.UpdateOne(
		ctx,
		bson.M{"_id": user.ID},
		bson.M{"$set": user},
	)
	return err
}

// Delete deletes a user
func (r *MongoDBUserRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.userCollection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

// List retrieves a list of users with pagination
func (r *MongoDBUserRepository) List(ctx context.Context, limit, offset int) ([]*model.User, error) {
	cursor, err := r.userCollection.Find(
		ctx,
		bson.M{},
		options.Find().SetLimit(int64(limit)).SetSkip(int64(offset)),
	)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var users []*model.User
	for cursor.Next(ctx) {
		var user model.User
		if err := cursor.Decode(&user); err != nil {
			return nil, err
		}
		users = append(users, &user)
	}

	return users, cursor.Err()
}

// CreateSession creates a new session
func (r *MongoDBUserRepository) CreateSession(ctx context.Context, session *model.Session) error {
	result, err := r.sessionCollection.InsertOne(ctx, session)
	if err != nil {
		return err
	}
	session.ID = result.InsertedID.(primitive.ObjectID)
	return nil
}

// GetSessionByToken retrieves a session by token
func (r *MongoDBUserRepository) GetSessionByToken(ctx context.Context, token string) (*model.Session, error) {
	var session model.Session
	err := r.sessionCollection.FindOne(ctx, bson.M{"token": token}).Decode(&session)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &session, nil
}

// DeleteSession deletes a session by token
func (r *MongoDBUserRepository) DeleteSession(ctx context.Context, token string) error {
	_, err := r.sessionCollection.DeleteOne(ctx, bson.M{"token": token})
	return err
}

// DeleteExpiredSessions deletes all expired sessions
func (r *MongoDBUserRepository) DeleteExpiredSessions(ctx context.Context) error {
	_, err := r.sessionCollection.DeleteMany(ctx, bson.M{
		"expiresAt": bson.M{"$lt": time.Now()},
	})
	return err
}

// DeleteUserSessions deletes all sessions for a specific user
func (r *MongoDBUserRepository) DeleteUserSessions(ctx context.Context, userID primitive.ObjectID) error {
	_, err := r.sessionCollection.DeleteMany(ctx, bson.M{"userId": userID})
	return err
} 