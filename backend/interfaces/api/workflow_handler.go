package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/phuhao00/cmdb/backend/application"
)

// WorkflowHandler handles HTTP requests for workflows
type WorkflowHandler struct {
	workflowApp *application.WorkflowApplication
}

// NewWorkflowHandler creates a new workflow handler
func NewWorkflowHandler(workflowApp *application.WorkflowApplication) *WorkflowHandler {
	return &WorkflowHandler{
		workflowApp: workflowApp,
	}
}

// RegisterRoutes registers the workflow routes
func (h *WorkflowHandler) RegisterRoutes(router *gin.RouterGroup) {
	workflows := router.Group("/workflows")
	{
		workflows.GET("", h.GetWorkflows)
		workflows.POST("", h.CreateWorkflow)
		workflows.GET("/:id", h.GetWorkflowByID)
		workflows.PUT("/:id/approve", h.ApproveWorkflow)
		workflows.PUT("/:id/reject", h.RejectWorkflow)
		workflows.GET("/stats", h.GetWorkflowStats)
		workflows.GET("/history/:assetId", h.GetAssetWorkflowHistory)
	}

	// Feishu webhook
	router.POST("/feishu/webhook", h.HandleFeishuWebhook)
}

// GetWorkflows handles GET /workflows
func (h *WorkflowHandler) GetWorkflows(c *gin.Context) {
	var filter application.WorkflowFilterDTO

	// Bind query parameters
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	workflows, err := h.workflowApp.GetWorkflows(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, workflows)
}

// GetWorkflowByID handles GET /workflows/:id
func (h *WorkflowHandler) GetWorkflowByID(c *gin.Context) {
	id := c.Param("id")

	workflow, err := h.workflowApp.GetWorkflowByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Workflow not found"})
		return
	}

	c.JSON(http.StatusOK, workflow)
}

// CreateWorkflow handles POST /workflows
func (h *WorkflowHandler) CreateWorkflow(c *gin.Context) {
	var createDTO application.WorkflowCreateDTO

	if err := c.ShouldBindJSON(&createDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	workflow, err := h.workflowApp.CreateWorkflow(c.Request.Context(), createDTO)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, workflow)
}

// ApproveWorkflow handles PUT /workflows/:id/approve
func (h *WorkflowHandler) ApproveWorkflow(c *gin.Context) {
	workflowID := c.Param("id")
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var dto application.ApproveWorkflowDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userDTO := user.(*application.UserDTO)
	err := h.workflowApp.ApproveWorkflow(c.Request.Context(), workflowID, userDTO.ID, userDTO.FullName, dto)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Workflow approved successfully"})
}

// RejectWorkflow handles PUT /workflows/:id/reject
func (h *WorkflowHandler) RejectWorkflow(c *gin.Context) {
	workflowID := c.Param("id")
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var dto application.RejectWorkflowDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userDTO := user.(*application.UserDTO)
	err := h.workflowApp.RejectWorkflow(c.Request.Context(), workflowID, userDTO.ID, userDTO.FullName, dto)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Workflow rejected successfully"})
}

// HandleFeishuWebhook handles POST /feishu/webhook
func (h *WorkflowHandler) HandleFeishuWebhook(c *gin.Context) {
	var webhookDTO application.FeishuWebhookDTO

	if err := c.ShouldBindJSON(&webhookDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.workflowApp.HandleFeishuWebhook(c.Request.Context(), webhookDTO)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Webhook processed successfully"})
}

// GetWorkflowStats handles GET /workflows/stats
func (h *WorkflowHandler) GetWorkflowStats(c *gin.Context) {
	statusStats, err := h.workflowApp.GetWorkflowStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	typeStats, err := h.workflowApp.GetWorkflowTypeStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"statusStats": statusStats,
		"typeStats":   typeStats,
	})
}

// GetAssetWorkflowHistory handles GET /workflows/history/:assetId
func (h *WorkflowHandler) GetAssetWorkflowHistory(c *gin.Context) {
	assetID := c.Param("assetId")

	workflows, err := h.workflowApp.GetAssetWorkflowHistory(c.Request.Context(), assetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, workflows)
}

// GetPendingWorkflows handles GET /workflows/pending
func (h *WorkflowHandler) GetPendingWorkflows(c *gin.Context) {
	workflows, err := h.workflowApp.GetPendingWorkflows(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, workflows)
}

// GetMyWorkflows handles GET /workflows/my
func (h *WorkflowHandler) GetMyWorkflows(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	workflows, err := h.workflowApp.GetUserWorkflows(c.Request.Context(), userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, workflows)
}
