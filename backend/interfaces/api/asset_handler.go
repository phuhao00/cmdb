package api

import (
	"net/http"
	"time"

	"github.com/cmdb/backend/application"
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
	var createDTO application.AssetCreateDTO
	
	if err := c.ShouldBindJSON(&createDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	asset, err := h.assetApp.CreateAsset(c.Request.Context(), createDTO)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, gin.H{
		"asset":   asset,
		"message": "Asset created and submitted for approval",
	})
}

// UpdateAsset handles PUT /assets/:id
func (h *AssetHandler) UpdateAsset(c *gin.Context) {
	id := c.Param("id")
	
	var updateDTO application.AssetUpdateDTO
	if err := c.ShouldBindJSON(&updateDTO); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	asset, err := h.assetApp.UpdateAsset(c.Request.Context(), id, updateDTO)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"asset":   asset,
		"message": "Asset updated successfully",
	})
}

// RequestDecommission handles DELETE /assets/:id
func (h *AssetHandler) RequestDecommission(c *gin.Context) {
	id := c.Param("id")
	
	err := h.assetApp.RequestDecommission(c.Request.Context(), id, "System User", "Asset decommission request")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Decommission workflow created",
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
		"message":      "Bulk asset creation successful",
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