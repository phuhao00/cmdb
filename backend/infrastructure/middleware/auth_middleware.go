package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/phuhao00/cmdb/backend/application"
)

// AuthMiddleware provides authentication and authorization middleware
type AuthMiddleware struct {
	authApp *application.AuthApplication
}

// NewAuthMiddleware creates a new authentication middleware
func NewAuthMiddleware(authApp *application.AuthApplication) *AuthMiddleware {
	return &AuthMiddleware{
		authApp: authApp,
	}
}

// RequireAuth middleware ensures the user is authenticated
func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>" format
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		token := tokenParts[1]

		// Validate token and get user
		user, err := m.authApp.ValidateToken(c.Request.Context(), token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Set user in context
		c.Set("user", user)
		c.Set("userID", user.ID)
		c.Next()
	}
}

// RequirePermission middleware ensures the user has the required permission
func (m *AuthMiddleware) RequirePermission(resource, action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}

		userDTO := user.(*application.UserDTO)

		// Check if user has the required permission
		if !m.hasPermission(userDTO, resource, action) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireRole middleware ensures the user has the required role
func (m *AuthMiddleware) RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}

		userDTO := user.(*application.UserDTO)

		// Check if user has the required role
		if userDTO.Role != role && userDTO.Role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient role privileges"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireApprovalPermission middleware ensures the user can approve workflows
func (m *AuthMiddleware) RequireApprovalPermission() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}

		userDTO := user.(*application.UserDTO)

		// Only admin and manager can approve workflows
		if userDTO.Role != "admin" && userDTO.Role != "manager" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Only administrators and managers can approve workflows"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// hasPermission checks if user has the required permission
func (m *AuthMiddleware) hasPermission(user *application.UserDTO, resource, action string) bool {
	// Admin has all permissions
	if user.Role == "admin" {
		return true
	}

	// Check specific permissions
	for _, perm := range user.Permissions {
		if perm.Resource == resource || perm.Resource == "*" {
			for _, allowedAction := range perm.Actions {
				if allowedAction == action || allowedAction == "*" {
					return true
				}
			}
		}
	}

	return false
}
