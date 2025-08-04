package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/phuhao00/cmdb/backend/domain/model"
	"github.com/phuhao00/cmdb/backend/domain/repository"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AuthService provides authentication and authorization services
type AuthService struct {
	userRepo repository.UserRepository
}

// NewAuthService creates a new auth service
func NewAuthService(userRepo repository.UserRepository) *AuthService {
	return &AuthService{
		userRepo: userRepo,
	}
}

// Login authenticates a user and creates a session
func (s *AuthService) Login(ctx context.Context, username, password string) (*model.User, string, error) {
	// Get user by username
	user, err := s.userRepo.GetByUsername(ctx, username)
	if err != nil {
		return nil, "", err
	}
	if user == nil {
		return nil, "", errors.New("invalid username or password")
	}

	// Check if user is active
	if !user.IsActive() {
		return nil, "", errors.New("user account is not active")
	}

	// Validate password
	if !user.ValidatePassword(password) {
		return nil, "", errors.New("invalid username or password")
	}

	// Generate session token
	token, err := s.generateToken()
	if err != nil {
		return nil, "", err
	}

	// Create session
	session := model.NewSession(user.ID, token, 24*time.Hour) // 24 hours
	if err := s.userRepo.CreateSession(ctx, session); err != nil {
		return nil, "", err
	}

	// Update last login time
	user.UpdateLastLogin()
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, "", err
	}

	return user, token, nil
}

// Logout invalidates a user's session
func (s *AuthService) Logout(ctx context.Context, token string) error {
	return s.userRepo.DeleteSession(ctx, token)
}

// ValidateToken validates a session token and returns the associated user
func (s *AuthService) ValidateToken(ctx context.Context, token string) (*model.User, error) {
	// Get session by token
	session, err := s.userRepo.GetSessionByToken(ctx, token)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, errors.New("invalid token")
	}

	// Check if session is expired
	if session.IsExpired() {
		// Delete expired session
		s.userRepo.DeleteSession(ctx, token)
		return nil, errors.New("session expired")
	}

	// Get user
	user, err := s.userRepo.GetByID(ctx, session.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
	}

	// Check if user is still active
	if !user.IsActive() {
		return nil, errors.New("user account is not active")
	}

	return user, nil
}

// CreateUser creates a new user (admin only)
func (s *AuthService) CreateUser(ctx context.Context, username, email, password, fullName string, role model.UserRole) (*model.User, error) {
	// Check if username already exists
	existingUser, err := s.userRepo.GetByUsername(ctx, username)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("username already exists")
	}

	// Check if email already exists
	existingUser, err = s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("email already exists")
	}

	// Create user
	user, err := model.NewUser(username, email, password, fullName, role)
	if err != nil {
		return nil, err
	}

	// Save user
	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

// ChangePassword changes a user's password
func (s *AuthService) ChangePassword(ctx context.Context, userID primitive.ObjectID, oldPassword, newPassword string) error {
	// Get user
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("user not found")
	}

	// Validate old password
	if !user.ValidatePassword(oldPassword) {
		return errors.New("invalid old password")
	}

	// Set new password
	if err := user.SetPassword(newPassword); err != nil {
		return err
	}

	// Update user
	if err := s.userRepo.Update(ctx, user); err != nil {
		return err
	}

	// Delete all user sessions to force re-login
	return s.userRepo.DeleteUserSessions(ctx, userID)
}

// GetUsers returns a list of users (admin only)
func (s *AuthService) GetUsers(ctx context.Context, limit, offset int) ([]*model.User, error) {
	return s.userRepo.List(ctx, limit, offset)
}

// GetUserByID returns a user by ID
func (s *AuthService) GetUserByID(ctx context.Context, id primitive.ObjectID) (*model.User, error) {
	return s.userRepo.GetByID(ctx, id)
}

// GetUserByUsername returns a user by username
func (s *AuthService) GetUserByUsername(ctx context.Context, username string) (*model.User, error) {
	return s.userRepo.GetByUsername(ctx, username)
}

// UpdateUserStatus updates a user's status (admin only)
func (s *AuthService) UpdateUserStatus(ctx context.Context, userID primitive.ObjectID, status model.UserStatus) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("user not found")
	}

	user.Status = status
	return s.userRepo.Update(ctx, user)
}

// CleanupExpiredSessions removes expired sessions
func (s *AuthService) CleanupExpiredSessions(ctx context.Context) error {
	return s.userRepo.DeleteExpiredSessions(ctx)
}

// generateToken generates a random session token
func (s *AuthService) generateToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
