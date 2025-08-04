package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/phuhao00/cmdb/backend/application"
)

// AuthHandler handles HTTP requests for authentication
type AuthHandler struct {
	authApp *application.AuthApplication
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(authApp *application.AuthApplication) *AuthHandler {
	return &AuthHandler{
		authApp: authApp,
	}
}

// RegisterRoutes registers the public auth routes (login only)
func (h *AuthHandler) RegisterRoutes(router *gin.RouterGroup) {
	auth := router.Group("/auth")
	{
		auth.POST("/login", h.Login)
	}
}

// RegisterProtectedRoutes registers the protected auth routes (require authentication)
func (h *AuthHandler) RegisterProtectedRoutes(router *gin.RouterGroup) {
	auth := router.Group("/auth")
	{
		auth.POST("/logout", h.Logout)
		auth.GET("/me", h.GetCurrentUser)
		auth.POST("/change-password", h.ChangePassword)
	}

	// Admin routes for user management
	users := router.Group("/users")
	{
		users.POST("", h.CreateUser)
		users.GET("", h.GetUsers)
		users.GET("/:id", h.GetUser)
		users.PUT("/:id/status", h.UpdateUserStatus)
	}
}

// Login handles POST /auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var loginDTO application.LoginDTO
	if err := c.ShouldBindJSON(&loginDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.authApp.Login(c.Request.Context(), loginDTO)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Set token in cookie for web clients
	c.SetCookie("auth_token", response.Token, 86400, "/", "", false, true)

	c.JSON(http.StatusOK, response)
}

// Logout handles POST /auth/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	token := h.extractToken(c)
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No token provided"})
		return
	}

	err := h.authApp.Logout(c.Request.Context(), token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Clear cookie
	c.SetCookie("auth_token", "", -1, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// GetCurrentUser handles GET /auth/me
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// ChangePassword handles POST /auth/change-password
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var changePasswordDTO application.ChangePasswordDTO
	if err := c.ShouldBindJSON(&changePasswordDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.authApp.ChangePassword(c.Request.Context(), userID.(string), changePasswordDTO)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}

// CreateUser handles POST /users (admin only)
func (h *AuthHandler) CreateUser(c *gin.Context) {
	var createUserDTO application.CreateUserDTO
	if err := c.ShouldBindJSON(&createUserDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.authApp.CreateUser(c.Request.Context(), createUserDTO)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"user": user, "message": "User created successfully"})
}

// GetUsers handles GET /users
func (h *AuthHandler) GetUsers(c *gin.Context) {
	limit := 20
	offset := 0

	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	users, err := h.authApp.GetUsers(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}

// GetUser handles GET /users/:id
func (h *AuthHandler) GetUser(c *gin.Context) {
	id := c.Param("id")

	user, err := h.authApp.GetUserByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// UpdateUserStatus handles PUT /users/:id/status (admin only)
func (h *AuthHandler) UpdateUserStatus(c *gin.Context) {
	id := c.Param("id")

	var updateStatusDTO application.UpdateUserStatusDTO
	if err := c.ShouldBindJSON(&updateStatusDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.authApp.UpdateUserStatus(c.Request.Context(), id, updateStatusDTO)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User status updated successfully"})
}

// extractToken extracts token from request
func (h *AuthHandler) extractToken(c *gin.Context) string {
	// Try Authorization header first
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" && len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		return authHeader[7:]
	}

	// Try cookie
	token, err := c.Cookie("auth_token")
	if err == nil && token != "" {
		return token
	}

	// Try query parameter
	return c.Query("token")
}
