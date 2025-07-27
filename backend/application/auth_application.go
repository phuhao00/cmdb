package application

import (
	"context"
	"errors"

	"github.com/cmdb/backend/domain/model"
	"github.com/cmdb/backend/domain/service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AuthApplication provides authentication application services
type AuthApplication struct {
	authService *service.AuthService
}

// NewAuthApplication creates a new auth application
func NewAuthApplication(authService *service.AuthService) *AuthApplication {
	return &AuthApplication{
		authService: authService,
	}
}

// LoginDTO represents login request data
type LoginDTO struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponseDTO represents login response data
type LoginResponseDTO struct {
	User  *UserDTO `json:"user"`
	Token string   `json:"token"`
}

// UserDTO represents user data for API responses
type UserDTO struct {
	ID          string                `json:"id"`
	Username    string                `json:"username"`
	Email       string                `json:"email"`
	FullName    string                `json:"fullName"`
	Role        string                `json:"role"`
	Status      string                `json:"status"`
	Permissions []model.Permission    `json:"permissions"`
	LastLoginAt *string               `json:"lastLoginAt"`
	CreatedAt   string                `json:"createdAt"`
}

// CreateUserDTO represents create user request data
type CreateUserDTO struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"fullName" binding:"required"`
	Role     string `json:"role" binding:"required"`
}

// ChangePasswordDTO represents change password request data
type ChangePasswordDTO struct {
	OldPassword string `json:"oldPassword" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=6"`
}

// UpdateUserStatusDTO represents update user status request data
type UpdateUserStatusDTO struct {
	Status string `json:"status" binding:"required"`
}

// Login authenticates a user
func (a *AuthApplication) Login(ctx context.Context, dto LoginDTO) (*LoginResponseDTO, error) {
	user, token, err := a.authService.Login(ctx, dto.Username, dto.Password)
	if err != nil {
		return nil, err
	}

	return &LoginResponseDTO{
		User:  a.userToDTO(user),
		Token: token,
	}, nil
}

// Logout invalidates a user's session
func (a *AuthApplication) Logout(ctx context.Context, token string) error {
	return a.authService.Logout(ctx, token)
}

// ValidateToken validates a session token
func (a *AuthApplication) ValidateToken(ctx context.Context, token string) (*UserDTO, error) {
	user, err := a.authService.ValidateToken(ctx, token)
	if err != nil {
		return nil, err
	}

	return a.userToDTO(user), nil
}

// CreateUser creates a new user
func (a *AuthApplication) CreateUser(ctx context.Context, dto CreateUserDTO) (*UserDTO, error) {
	role := model.UserRole(dto.Role)
	
	// Validate role
	if role != model.AdminRole && role != model.ManagerRole && 
	   role != model.OperatorRole && role != model.ViewerRole {
		return nil, errors.New("invalid role")
	}

	user, err := a.authService.CreateUser(ctx, dto.Username, dto.Email, dto.Password, dto.FullName, role)
	if err != nil {
		return nil, err
	}

	return a.userToDTO(user), nil
}

// GetUsers returns a list of users
func (a *AuthApplication) GetUsers(ctx context.Context, limit, offset int) ([]*UserDTO, error) {
	users, err := a.authService.GetUsers(ctx, limit, offset)
	if err != nil {
		return nil, err
	}

	var userDTOs []*UserDTO
	for _, user := range users {
		userDTOs = append(userDTOs, a.userToDTO(user))
	}

	return userDTOs, nil
}

// GetUserByID returns a user by ID
func (a *AuthApplication) GetUserByID(ctx context.Context, idStr string) (*UserDTO, error) {
	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		return nil, err
	}

	user, err := a.authService.GetUserByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
	}

	return a.userToDTO(user), nil
}

// ChangePassword changes a user's password
func (a *AuthApplication) ChangePassword(ctx context.Context, userIDStr string, dto ChangePasswordDTO) error {
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return err
	}

	return a.authService.ChangePassword(ctx, userID, dto.OldPassword, dto.NewPassword)
}

// UpdateUserStatus updates a user's status
func (a *AuthApplication) UpdateUserStatus(ctx context.Context, userIDStr string, dto UpdateUserStatusDTO) error {
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return err
	}

	status := model.UserStatus(dto.Status)
	if status != model.ActiveStatus && status != model.InactiveStatus && status != model.LockedStatus {
		return errors.New("invalid status")
	}

	return a.authService.UpdateUserStatus(ctx, userID, status)
}

// userToDTO converts a user model to DTO
func (a *AuthApplication) userToDTO(user *model.User) *UserDTO {
	dto := &UserDTO{
		ID:          user.ID.Hex(),
		Username:    user.Username,
		Email:       user.Email,
		FullName:    user.FullName,
		Role:        string(user.Role),
		Status:      string(user.Status),
		Permissions: user.Permissions,
		CreatedAt:   user.CreatedAt.Format("2006-01-02 15:04:05"),
	}

	if user.LastLoginAt != nil {
		lastLogin := user.LastLoginAt.Format("2006-01-02 15:04:05")
		dto.LastLoginAt = &lastLogin
	}

	return dto
} 