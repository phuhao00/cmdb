package repository

import (
	"context"

	"github.com/cmdb/backend/domain/model"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// UserRepository defines the interface for user data operations
type UserRepository interface {
	// User operations
	Create(ctx context.Context, user *model.User) error
	GetByID(ctx context.Context, id primitive.ObjectID) (*model.User, error)
	GetByUsername(ctx context.Context, username string) (*model.User, error)
	GetByEmail(ctx context.Context, email string) (*model.User, error)
	Update(ctx context.Context, user *model.User) error
	Delete(ctx context.Context, id primitive.ObjectID) error
	List(ctx context.Context, limit, offset int) ([]*model.User, error)
	
	// Session operations
	CreateSession(ctx context.Context, session *model.Session) error
	GetSessionByToken(ctx context.Context, token string) (*model.Session, error)
	DeleteSession(ctx context.Context, token string) error
	DeleteExpiredSessions(ctx context.Context) error
	DeleteUserSessions(ctx context.Context, userID primitive.ObjectID) error
} 