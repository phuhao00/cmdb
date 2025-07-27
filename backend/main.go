package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/cmdb/backend/application"
	"github.com/cmdb/backend/domain/model"
	"github.com/cmdb/backend/domain/service"
	"github.com/cmdb/backend/infrastructure/middleware"
	"github.com/cmdb/backend/infrastructure/persistence"
	"github.com/cmdb/backend/interfaces/api"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Initialize MongoDB
	mongoURI := getEnv("MONGO_URI", "mongodb://localhost:27017")
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer client.Disconnect(context.Background())

	database := client.Database("cmdb")

	// Initialize repositories
	assetRepo := persistence.NewMongoDBAssetRepository(database)
	workflowRepo := persistence.NewMongoDBWorkflowRepository(database)
	userRepo := persistence.NewMongoDBUserRepository(database)

	// Initialize services
	assetService := service.NewAssetService(assetRepo, workflowRepo)
	workflowService := service.NewWorkflowService(workflowRepo, assetRepo)
	authService := service.NewAuthService(userRepo)
	aiService := service.NewAIService(assetService, workflowService, userRepo)

	// Initialize applications
	assetApp := application.NewAssetApplication(assetService, workflowService)
	workflowApp := application.NewWorkflowApplication(workflowService)
	authApp := application.NewAuthApplication(authService)
	aiApp := application.NewAIApplication(aiService)

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

	// Setup Gin router
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

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

		// Protected routes
		protected := api.Group("/")
		protected.Use(authMiddleware.RequireAuth())
		{
			// AI routes
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
				}

				deleteGroup := assets.Group("/")
				deleteGroup.Use(authMiddleware.RequirePermission("assets", "delete"))
				{
					deleteGroup.DELETE("/:id", assetHandler.RequestDecommission)
				}
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

				// Approval operations require special permissions
				approvalGroup := workflows.Group("/")
				approvalGroup.Use(authMiddleware.RequireApprovalPermission())
				{
					approvalGroup.POST("/:id/approve", workflowHandler.ApproveWorkflow)
					approvalGroup.POST("/:id/reject", workflowHandler.RejectWorkflow)
				}
			}

			// Reports routes
			reports := protected.Group("/reports")
			reports.Use(authMiddleware.RequirePermission("reports", "read"))
			{
				reportsHandler.RegisterRoutes(reports)
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
	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
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
		log.Printf("Warning: Failed to create default admin user: %v", err)
	} else {
		log.Println("Default admin user created - Username: admin, Password: admin123")
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
