package api

import (
	"net/http"

	"github.com/cmdb/backend/application"
	"github.com/gin-gonic/gin"
)

// AIHandler handles HTTP requests for AI features
type AIHandler struct {
	aiApp *application.AIApplication
}

// NewAIHandler creates a new AI handler
func NewAIHandler(aiApp *application.AIApplication) *AIHandler {
	return &AIHandler{
		aiApp: aiApp,
	}
}

// RegisterRoutes registers the AI routes
func (h *AIHandler) RegisterRoutes(router *gin.RouterGroup) {
	ai := router.Group("/ai")
	{
		ai.POST("/chat", h.Chat)
		ai.GET("/suggestions", h.GetSuggestions)
	}
}

// Chat handles POST /ai/chat
func (h *AIHandler) Chat(c *gin.Context) {
	// Get user from context (set by auth middleware)
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID required"})
		return
	}

	var chatRequest application.ChatRequest
	if err := c.ShouldBindJSON(&chatRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Extract user permissions
	userDTO := user.(*application.UserDTO)
	userPermissions := make([]application.UserPermission, len(userDTO.Permissions))
	for i, perm := range userDTO.Permissions {
		userPermissions[i] = application.UserPermission{
			Resource: perm.Resource,
			Actions:  perm.Actions,
		}
	}

	// Process chat
	response, err := h.aiApp.ProcessChat(c.Request.Context(), userID.(string), userPermissions, chatRequest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetSuggestions handles GET /ai/suggestions
func (h *AIHandler) GetSuggestions(c *gin.Context) {
	// Get user from context for permission-based suggestions
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	userDTO := user.(*application.UserDTO)
	suggestions := h.generateSuggestions(userDTO)

	c.JSON(http.StatusOK, gin.H{
		"suggestions": suggestions,
	})
}

// generateSuggestions generates context-aware suggestions based on user permissions
func (h *AIHandler) generateSuggestions(user *application.UserDTO) []string {
	suggestions := []string{
		"帮助",
		"系统状态",
	}

	// Add permission-based suggestions
	for _, perm := range user.Permissions {
		if perm.Resource == "assets" || perm.Resource == "*" {
			if h.hasAction(perm.Actions, "read") {
				suggestions = append(suggestions,
					"查看所有资产",
					"查看在线资产",
					"查看服务器资产",
					"资产统计")
			}
		}
		if perm.Resource == "workflows" || perm.Resource == "*" {
			if h.hasAction(perm.Actions, "read") {
				suggestions = append(suggestions,
					"我的工作流",
					"待审批工作流",
					"工作流统计")
			}
		}
	}

	// Role-based suggestions
	switch user.Role {
	case "admin", "manager":
		suggestions = append(suggestions,
			"系统统计",
			"用户管理",
			"审批工作流")
	case "operator":
		suggestions = append(suggestions,
			"我的资产操作",
			"提交资产申请")
	}

	return suggestions
}

// hasAction checks if actions slice contains a specific action
func (h *AIHandler) hasAction(actions []string, action string) bool {
	for _, a := range actions {
		if a == action || a == "*" {
			return true
		}
	}
	return false
}
