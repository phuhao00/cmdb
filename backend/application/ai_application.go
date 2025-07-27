package application

import (
	"context"
	"time"

	"github.com/cmdb/backend/domain/model"
	"github.com/cmdb/backend/domain/service"
)

// AIApplication provides AI application services
type AIApplication struct {
	aiService *service.AIService
}

// NewAIApplication creates a new AI application
func NewAIApplication(aiService *service.AIService) *AIApplication {
	return &AIApplication{
		aiService: aiService,
	}
}

// ChatRequest represents a chat request from the user
type ChatRequest struct {
	Message string `json:"message" binding:"required"`
}

// ChatResponse represents a chat response to the user
type ChatResponse struct {
	Message     string      `json:"message"`
	Intent      string      `json:"intent"`
	Data        interface{} `json:"data,omitempty"`
	Suggestions []string    `json:"suggestions,omitempty"`
	Timestamp   string      `json:"timestamp"`
}

// ProcessChat processes a chat message and returns an AI response
func (a *AIApplication) ProcessChat(ctx context.Context, userID string, userPermissions []UserPermission, request ChatRequest) (*ChatResponse, error) {
	// Convert UserPermission to domain Permission
	permissions := convertToModelPermissions(userPermissions)

	// Process the query using AI service
	response, err := a.aiService.ProcessQuery(ctx, userID, request.Message, permissions)
	if err != nil {
		return nil, err
	}

	// Convert to application DTO
	return &ChatResponse{
		Message:     response.Message,
		Intent:      string(response.Intent),
		Data:        response.Data,
		Suggestions: response.Suggestions,
		Timestamp:   getCurrentTimestamp(),
	}, nil
}

// UserPermission represents user permission in application layer
type UserPermission struct {
	Resource string   `json:"resource"`
	Actions  []string `json:"actions"`
}

// convertToModelPermissions converts application permissions to domain permissions
func convertToModelPermissions(userPermissions []UserPermission) []model.Permission {
	permissions := make([]model.Permission, len(userPermissions))

	for i, perm := range userPermissions {
		permissions[i] = model.Permission{
			Resource: perm.Resource,
			Actions:  perm.Actions,
		}
	}

	return permissions
}

// getCurrentTimestamp returns current timestamp in ISO format
func getCurrentTimestamp() string {
	return time.Now().Format(time.RFC3339)
}
