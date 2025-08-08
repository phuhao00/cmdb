package main

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/phuhao00/cmdb/backend/application"
	"github.com/phuhao00/cmdb/backend/domain/model"
	"github.com/phuhao00/cmdb/backend/domain/service"
	"github.com/phuhao00/cmdb/backend/infrastructure/logging"
	"github.com/phuhao00/cmdb/backend/infrastructure/middleware"
	"github.com/phuhao00/cmdb/backend/infrastructure/persistence"
	"github.com/phuhao00/cmdb/backend/interfaces/api"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
)

func main() {
	// Initialize structured logging first
	if err := logging.Init(); err != nil {
		panic("failed to init logger: " + err.Error())
	}
	defer logging.Sync()

	logger := logging.Logger

	// Initialize MongoDB
	mongoURI := getEnv("MONGO_URI", "mongodb://localhost:27017")
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(mongoURI))
	if err != nil {
		logger.Fatal("Failed to connect to MongoDB", zap.Error(err), zap.String("mongo_uri", mongoURI))
	}
	defer client.Disconnect(context.Background())

	database := client.Database("cmdb")

	// Initialize repositories
	assetRepo := persistence.NewMongoDBAssetRepository(database)
	workflowRepo := persistence.NewMongoDBWorkflowRepository(database)
	userRepo := persistence.NewMongoDBUserRepository(database)
	auditLogRepo := persistence.NewMongoAuditLogRepository(database)

	// Initialize services
	assetService := service.NewAssetService(assetRepo, workflowRepo)
	workflowService := service.NewWorkflowService(workflowRepo, assetRepo)
	authService := service.NewAuthService(userRepo)
	aiService := service.NewAIService(assetService, workflowService, userRepo)
	auditLogService := service.NewAuditLogService(auditLogRepo)

	// Initialize applications
	assetApp := application.NewAssetApplication(assetService, workflowService)
	workflowApp := application.NewWorkflowApplication(workflowService)
	authApp := application.NewAuthApplication(authService)
	aiApp := application.NewAIApplication(aiService)
	auditLogApp := application.NewAuditLogApplication(auditLogService)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(authApp)

	// Create default admin user if not exists
	createDefaultAdmin(authService)

	// Initialize handlers
	assetHandler := api.NewAssetHandler(assetApp)
	workflowHandler := api.NewWorkflowHandler(workflowApp)
	reportsHandler := api.NewReportsHandler(assetApp, workflowApp)
	authHandler := api.NewAuthHandler(authApp)
	aiHandler := api.NewAIHandler(aiApp)
	auditLogHandler := api.NewAuditLogHandler(auditLogApp)

	// Setup Gin router
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.RequestLogger())

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:8080", "*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// API routes
	api := router.Group("/api")
	{
		// Public auth routes
		authHandler.RegisterRoutes(api)

		// Temporary AI test route (no auth required)
		api.POST("/ai/test", func(c *gin.Context) {
			var req application.ChatRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(400, gin.H{"error": "Invalid request format"})
				return
			}

			// Use test user permissions for AI testing
			testPermissions := []application.UserPermission{
				{Resource: "*", Actions: []string{"*"}},
			}

			// Call AI service with test user
			response, err := aiApp.ProcessChat(c.Request.Context(), "test-user", testPermissions, req)
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}

			c.JSON(200, response)
		})

		// Protected routes
		protected := api.Group("/")
		protected.Use(authMiddleware.RequireAuth())
		{
			// Protected auth routes (me, logout, change-password, user management)
			authHandler.RegisterProtectedRoutes(protected)

			// AI routes - ensure they're properly protected
			aiHandler.RegisterRoutes(protected)

			// Asset routes with permission checks
			assets := protected.Group("/assets")
			assets.Use(authMiddleware.RequirePermission("assets", "read"))
			{
				assets.GET("", assetHandler.GetAssets)
				assets.GET("/stats", assetHandler.GetAssetStats)
				assets.GET("/types", assetHandler.GetAssetTypes)
				assets.GET("/locations", assetHandler.GetAssetLocations)
				assets.GET("/costs", assetHandler.GetAssetCosts)
				assets.GET("/critical", assetHandler.GetCriticalAssets)
				assets.GET("/departments", assetHandler.GetDepartments)
				assets.GET("/owners", assetHandler.GetOwners)
				assets.GET("/tags", assetHandler.GetAllTags)
				assets.GET("/:id", assetHandler.GetAssetByID)

				// Write operations require additional permissions
				createGroup := assets.Group("/")
				createGroup.Use(authMiddleware.RequirePermission("assets", "create"))
				{
					createGroup.POST("", assetHandler.CreateAsset)
					createGroup.POST("/bulk", assetHandler.BulkCreateAssets)
				}

				updateGroup := assets.Group("/")
				updateGroup.Use(authMiddleware.RequirePermission("assets", "update"))
				{
					updateGroup.PUT("/:id", assetHandler.UpdateAsset)
					updateGroup.PUT("/:id/costs", assetHandler.UpdateAssetCosts)
					updateGroup.POST("/:id/tags", assetHandler.AddTags)
				}

				deleteGroup := assets.Group("/")
				deleteGroup.Use(authMiddleware.RequirePermission("assets", "delete"))
				{
					deleteGroup.DELETE("/:id", assetHandler.RequestDecommission)
					deleteGroup.DELETE("/:id/tags/:tag", assetHandler.RemoveTag)
				}

				// Search endpoint
				assets.POST("/search", assetHandler.AdvancedSearch)
			}

			// Workflow routes
			workflows := protected.Group("/workflows")
			workflows.Use(authMiddleware.RequirePermission("workflows", "read"))
			{
				workflows.GET("", workflowHandler.GetWorkflows)
				workflows.GET("/stats", workflowHandler.GetWorkflowStats)
				workflows.GET("/pending", workflowHandler.GetPendingWorkflows)
				workflows.GET("/my", workflowHandler.GetMyWorkflows)
				workflows.GET("/:id", workflowHandler.GetWorkflowByID)

				// Create workflow
				createGroup := workflows.Group("/")
				createGroup.Use(authMiddleware.RequirePermission("workflows", "create"))
				{
					createGroup.POST("", workflowHandler.CreateWorkflow)
				}

				// Approval operations require special permissions
				approvalGroup := workflows.Group("/")
				approvalGroup.Use(authMiddleware.RequireApprovalPermission())
				{
					approvalGroup.PUT("/:id/approve", workflowHandler.ApproveWorkflow)
					approvalGroup.PUT("/:id/reject", workflowHandler.RejectWorkflow)
				}
			}

			// Reports routes
			reports := protected.Group("/reports")
			reports.Use(authMiddleware.RequirePermission("reports", "read"))
			{
				reportsHandler.RegisterRoutes(reports)
			}

			// Audit log routes
			auditLogs := protected.Group("/")
			auditLogs.Use(authMiddleware.RequirePermission("audit", "read"))
			{
				auditLogHandler.RegisterRoutes(auditLogs)
			}

			// Admin-only user management routes
			users := protected.Group("/users")
			users.Use(authMiddleware.RequireRole("admin"))
			{
				// User management routes are already registered in authHandler
			}
		}
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "timestamp": time.Now()})
	})

	// Start server
	port := getEnv("PORT", "8080")
	logger.Info("server_starting", zap.String("port", port))
	if err := http.ListenAndServe(":"+port, router); err != nil {
		logger.Fatal("server_failed", zap.Error(err))
	}
}

func createDefaultAdmin(authService *service.AuthService) {
	ctx := context.Background()

	// Check if admin user already exists
	admin, err := authService.GetUserByUsername(ctx, "admin")
	if err == nil && admin != nil {
		return
	}

	// Create default admin user
	_, err = authService.CreateUser(ctx, "admin", "admin@cmdb.local", "admin123", "System Administrator", model.AdminRole)
	if err != nil {
		logging.Logger.Warn("create_default_admin_failed", zap.Error(err))
	} else {
		logging.Logger.Info("default_admin_created", zap.String("username", "admin"))
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
