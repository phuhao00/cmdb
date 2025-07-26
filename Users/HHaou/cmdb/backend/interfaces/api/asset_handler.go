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
    }
}