package api

import (
	"net/http"
	"time"

	"github.com/phuhao00/cmdb/backend/application"
	"github.com/gin-gonic/gin"
)

// AssetHandler handles HTTP requests for assets
type AssetHandler struct {
	assetApp *application.AssetApplication
}

// NewAssetHandler creates a new asset handler
func NewAssetHandler(assetApp *application.AssetApplication) *AssetHandler {
	return &AssetHandler{
		assetApp: assetApp,
	}
}

// RegisterRoutes registers the asset routes
func (h *AssetHandler) RegisterRoutes(router *gin.RouterGroup) {
	assets := router.Group("/assets")
	{
		assets.GET("", h.GetAssets)
		assets.POST("", h.CreateAsset)
		assets.GET("/:id", h.GetAssetByID)
		assets.PUT("/:id", h.UpdateAsset)
		assets.DELETE("/:id", h.RequestDecommission)
		assets.GET("/stats", h.GetAssetStats)
		assets.POST("/bulk", h.BulkCreateAssets)
		assets.GET("/types", h.GetAssetTypes)
		assets.GET("/locations", h.GetAssetLocations)
		// New cost-related endpoints
		assets.GET("/costs", h.GetAssetCosts)
		assets.GET("/critical", h.GetCriticalAssets)
		assets.PUT("/:id/costs", h.UpdateAssetCosts)

		// Tag management endpoints
		assets.POST("/:id/tags", h.AddTags)
		assets.DELETE("/:id/tags/:tag", h.RemoveTag)
		assets.GET("/tags", h.GetAllTags)

		// Advanced search and filtering
		assets.POST("/search", h.AdvancedSearch)
		assets.GET("/departments", h.GetDepartments)
		assets.GET("/owners", h.GetOwners)
	}
}

// GetAssets handles GET /assets
func (h *AssetHandler) GetAssets(c *gin.Context) {
	var filter application.AssetFilterDTO

	// Bind query parameters
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse date parameters if provided
	if fromDateStr := c.Query("fromDate"); fromDateStr != "" {
		if fromDate, err := time.Parse("2006-01-02", fromDateStr); err == nil {
			filter.FromDate = fromDate
		}
	}

	if toDateStr := c.Query("toDate"); toDateStr != "" {
		if toDate, err := time.Parse("2006-01-02", toDateStr); err == nil {
			filter.ToDate = toDate
		}
	}

	assets, err := h.assetApp.GetAssets(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, assets)
}

// GetAssetByID handles GET /assets/:id
func (h *AssetHandler) GetAssetByID(c *gin.Context) {
	id := c.Param("id")

	asset, err := h.assetApp.GetAssetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found"})
		return
	}

	c.JSON(http.StatusOK, asset)
}

// CreateAsset handles POST /assets
func (h *AssetHandler) CreateAsset(c *gin.Context) {
	// Get user from context (set by auth middleware)
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var createDTO application.AssetCreateDTO

	if err := c.ShouldBindJSON(&createDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Add user context to DTO
	createDTO.Requester = user.(*application.UserDTO).Username
	createDTO.RequesterID = user.(*application.UserDTO).ID

	asset, err := h.assetApp.CreateAssetWithApproval(c.Request.Context(), createDTO)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"asset":   asset,
		"message": "Asset creation submitted for approval",
	})
}

// UpdateAsset handles PUT /assets/:id
func (h *AssetHandler) UpdateAsset(c *gin.Context) {
	// Get user from context (set by auth middleware)
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	id := c.Param("id")

	var updateDTO application.AssetUpdateDTO
	if err := c.ShouldBindJSON(&updateDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Add user context to DTO
	updateDTO.Requester = user.(*application.UserDTO).Username
	updateDTO.RequesterID = user.(*application.UserDTO).ID

	err := h.assetApp.UpdateAssetWithApproval(c.Request.Context(), id, updateDTO)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Asset update submitted for approval",
	})
}

// RequestDecommission handles DELETE /assets/:id
func (h *AssetHandler) RequestDecommission(c *gin.Context) {
	// Get user from context (set by auth middleware)
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	id := c.Param("id")

	err := h.assetApp.RequestDecommission(c.Request.Context(), id, user.(*application.UserDTO).Username, user.(*application.UserDTO).ID, "Asset decommission request")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Decommission request submitted for approval",
	})
}

// GetAssetStats handles GET /assets/stats
func (h *AssetHandler) GetAssetStats(c *gin.Context) {
	stats, err := h.assetApp.GetAssetStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// BulkCreateAssets handles POST /assets/bulk
func (h *AssetHandler) BulkCreateAssets(c *gin.Context) {
	var createDTOs []application.AssetCreateDTO

	if err := c.ShouldBindJSON(&createDTOs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	count, err := h.assetApp.BulkCreateAssets(c.Request.Context(), createDTOs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":       "Bulk asset creation successful",
		"assetsCreated": count,
	})
}

// GetAssetTypes handles GET /assets/types
func (h *AssetHandler) GetAssetTypes(c *gin.Context) {
	types, err := h.assetApp.GetAssetTypes(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to array format for API
	var result []map[string]interface{}
	for typeName, count := range types {
		result = append(result, map[string]interface{}{
			"type":  typeName,
			"count": count,
		})
	}

	c.JSON(http.StatusOK, result)
}

// GetAssetLocations handles GET /assets/locations
func (h *AssetHandler) GetAssetLocations(c *gin.Context) {
	locations, err := h.assetApp.GetAssetLocations(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert to array format for API
	var result []map[string]interface{}
	for location, count := range locations {
		result = append(result, map[string]interface{}{
			"location": location,
			"count":    count,
		})
	}

	c.JSON(http.StatusOK, result)
}

// GetAssetCosts handles GET /assets/costs
func (h *AssetHandler) GetAssetCosts(c *gin.Context) {
	costs, err := h.assetApp.GetAssetCosts(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, costs)
}

// GetCriticalAssets handles GET /assets/critical
func (h *AssetHandler) GetCriticalAssets(c *gin.Context) {
	assets, err := h.assetApp.GetCriticalAssets(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, assets)
}

// UpdateAssetCosts handles PUT /assets/:id/costs
func (h *AssetHandler) UpdateAssetCosts(c *gin.Context) {
	id := c.Param("id")

	var costsDTO application.AssetUpdateCostsDTO
	if err := c.ShouldBindJSON(&costsDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.assetApp.UpdateAssetCosts(c.Request.Context(), id, costsDTO)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Asset costs updated successfully"})
}

// AddTags handles POST /assets/:id/tags
func (h *AssetHandler) AddTags(c *gin.Context) {
	id := c.Param("id")

	var req application.AssetTagDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.assetApp.AddAssetTags(c.Request.Context(), id, req.Tags)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tags added successfully"})
}

// RemoveTag handles DELETE /assets/:id/tags/:tag
func (h *AssetHandler) RemoveTag(c *gin.Context) {
	id := c.Param("id")
	tag := c.Param("tag")

	err := h.assetApp.RemoveAssetTag(c.Request.Context(), id, tag)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tag removed successfully"})
}

// GetAllTags handles GET /assets/tags
func (h *AssetHandler) GetAllTags(c *gin.Context) {
	tags, err := h.assetApp.GetAllTags(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"tags": tags})
}

// AdvancedSearch handles POST /assets/search
func (h *AssetHandler) AdvancedSearch(c *gin.Context) {
	var searchDTO application.AssetSearchDTO
	if err := c.ShouldBindJSON(&searchDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set defaults
	if searchDTO.Page < 1 {
		searchDTO.Page = 1
	}
	if searchDTO.Limit < 1 {
		searchDTO.Limit = 50
	}
	if searchDTO.Limit > 500 {
		searchDTO.Limit = 500
	}

	assets, total, err := h.assetApp.SearchAssets(c.Request.Context(), searchDTO)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"assets": assets,
		"total":  total,
		"page":   searchDTO.Page,
		"limit":  searchDTO.Limit,
	})
}

// GetDepartments handles GET /assets/departments
func (h *AssetHandler) GetDepartments(c *gin.Context) {
	departments, err := h.assetApp.GetDepartments(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"departments": departments})
}

// GetOwners handles GET /assets/owners
func (h *AssetHandler) GetOwners(c *gin.Context) {
	owners, err := h.assetApp.GetOwners(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"owners": owners})
}
