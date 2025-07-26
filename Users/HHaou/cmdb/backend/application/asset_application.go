func GetAssets(c *gin.Context) {
    // 确保这里的路径与前端请求路径一致
    c.JSON(http.StatusOK, gin.H{
        "data": []string{"Asset1", "Asset2"},
    })
}