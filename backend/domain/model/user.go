package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

// UserRole represents the role of a user
type UserRole string

// UserStatus represents the status of a user
type UserStatus string

// User role constants
const (
	AdminRole    UserRole = "admin"
	ManagerRole  UserRole = "manager"
	OperatorRole UserRole = "operator"
	ViewerRole   UserRole = "viewer"
)

// User status constants
const (
	ActiveStatus   UserStatus = "active"
	InactiveStatus UserStatus = "inactive"
	LockedStatus   UserStatus = "locked"
)

// Permission represents what actions a user can perform
type Permission struct {
	Resource string `json:"resource" bson:"resource"`
	Actions  []string `json:"actions" bson:"actions"`
}

// User represents a user in the CMDB system
type User struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Username    string             `json:"username" bson:"username"`
	Email       string             `json:"email" bson:"email"`
	Password    string             `json:"-" bson:"password"`
	FullName    string             `json:"fullName" bson:"fullName"`
	Role        UserRole           `json:"role" bson:"role"`
	Status      UserStatus         `json:"status" bson:"status"`
	Permissions []Permission       `json:"permissions" bson:"permissions"`
	LastLoginAt *time.Time         `json:"lastLoginAt" bson:"lastLoginAt"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
}

// NewUser creates a new user with default values
func NewUser(username, email, password, fullName string, role UserRole) (*User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	user := &User{
		Username:    username,
		Email:       email,
		Password:    string(hashedPassword),
		FullName:    fullName,
		Role:        role,
		Status:      ActiveStatus,
		Permissions: getDefaultPermissions(role),
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	return user, nil
}

// ValidatePassword validates the provided password against the user's password
func (u *User) ValidatePassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

// SetPassword sets a new password for the user
func (u *User) SetPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	u.UpdatedAt = time.Now()
	return nil
}

// UpdateLastLogin updates the user's last login time
func (u *User) UpdateLastLogin() {
	now := time.Now()
	u.LastLoginAt = &now
	u.UpdatedAt = now
}

// IsActive checks if the user is active
func (u *User) IsActive() bool {
	return u.Status == ActiveStatus
}

// IsAdmin checks if the user is an admin
func (u *User) IsAdmin() bool {
	return u.Role == AdminRole
}

// IsManager checks if the user is a manager
func (u *User) IsManager() bool {
	return u.Role == ManagerRole
}

// CanApprove checks if the user can approve workflows
func (u *User) CanApprove() bool {
	return u.Role == AdminRole || u.Role == ManagerRole
}

// HasPermission checks if the user has permission for a specific resource and action
func (u *User) HasPermission(resource, action string) bool {
	// Admin has all permissions
	if u.Role == AdminRole {
		return true
	}

	for _, perm := range u.Permissions {
		if perm.Resource == resource {
			for _, allowedAction := range perm.Actions {
				if allowedAction == action || allowedAction == "*" {
					return true
				}
			}
		}
	}
	return false
}

// getDefaultPermissions returns default permissions based on user role
func getDefaultPermissions(role UserRole) []Permission {
	switch role {
	case AdminRole:
		return []Permission{
			{Resource: "*", Actions: []string{"*"}},
		}
	case ManagerRole:
		return []Permission{
			{Resource: "assets", Actions: []string{"create", "read", "update", "delete", "approve"}},
			{Resource: "workflows", Actions: []string{"read", "approve", "reject"}},
			{Resource: "users", Actions: []string{"read"}},
			{Resource: "reports", Actions: []string{"read"}},
		}
	case OperatorRole:
		return []Permission{
			{Resource: "assets", Actions: []string{"create", "read", "update"}},
			{Resource: "workflows", Actions: []string{"read"}},
			{Resource: "reports", Actions: []string{"read"}},
		}
	case ViewerRole:
		return []Permission{
			{Resource: "assets", Actions: []string{"read"}},
			{Resource: "workflows", Actions: []string{"read"}},
			{Resource: "reports", Actions: []string{"read"}},
		}
	default:
		return []Permission{}
	}
}

// Session represents a user session
type Session struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	Token     string             `json:"token" bson:"token"`
	ExpiresAt time.Time          `json:"expiresAt" bson:"expiresAt"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
}

// NewSession creates a new session
func NewSession(userID primitive.ObjectID, token string, duration time.Duration) *Session {
	now := time.Now()
	return &Session{
		UserID:    userID,
		Token:     token,
		ExpiresAt: now.Add(duration),
		CreatedAt: now,
	}
}

// IsExpired checks if the session is expired
func (s *Session) IsExpired() bool {
	return time.Now().After(s.ExpiresAt)
} 