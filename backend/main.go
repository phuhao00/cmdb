package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/cmdb/backend/application"
	"github.com/cmdb/backend/domain/service"
	"github.com/cmdb/backend/infrastructure/consul"
	"github.com/cmdb/backend/infrastructure/persistence"
	"github.com/cmdb/backend/interfaces/api"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Initialize MongoDB connection
	mongoURI := getEnv("MONGO_URI", "mongodb://localhost:27017")
	mongoClient, err := connectToMongoDB(mongoURI)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer func() {
		if err := mongoClient.Disconnect(context.Background()); err != nil {
			log.Printf("Error disconnecting from MongoDB: %v", err)
		}
	}()

	// Initialize database
	db := mongoClient.Database("cmdb")

	// Initialize repositories
	assetRepo := persistence.NewMongoDBAssetRepository(db)
	workflowRepo := persistence.NewMongoDBWorkflowRepository(db)

	// Initialize domain services
	assetService := service.NewAssetService(assetRepo, workflowRepo)
	workflowService := service.NewWorkflowService(workflowRepo, assetRepo)

	// Initialize application services
	assetApp := application.NewAssetApplication(assetService)
	workflowApp := application.NewWorkflowApplication(workflowService)

	// Initialize Consul client
	consulAddress := getEnv("CONSUL_ADDRESS", "localhost:8500")
	consulClient, err := consul.NewConsulClient(consulAddress)
	if err != nil {
		log.Printf("Warning: Failed to connect to Consul: %v", err)
	}

	// Initialize Gin router
	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	// API routes
	apiGroup := router.Group("/api/v1")
	{
		// Register handlers
		assetHandler := api.NewAssetHandler(assetApp)
		workflowHandler := api.NewWorkflowHandler(workflowApp)

		assetHandler.RegisterRoutes(apiGroup)
		workflowHandler.RegisterRoutes(apiGroup)
	}

	// Get server port
	port := getEnv("PORT", "8080")
	serverAddress := fmt.Sprintf(":%s", port)

	// Register service with Consul if available
	if consulClient != nil {
		serviceID := fmt.Sprintf("cmdb-service-%s", port)
		serviceName := "cmdb-service"
		serviceAddress := getEnv("SERVICE_ADDRESS", "localhost")

		portInt := 8080
		fmt.Sscanf(port, "%d", &portInt)

		err := consulClient.RegisterService(serviceID, serviceName, serviceAddress, portInt, []string{"api", "cmdb"})
		if err != nil {
			log.Printf("Warning: Failed to register service with Consul: %v", err)
		} else {
			log.Printf("Service registered with Consul: %s", serviceID)

			// Deregister service on shutdown
			defer func() {
				if err := consulClient.DeregisterService(serviceID); err != nil {
					log.Printf("Error deregistering service from Consul: %v", err)
				}
			}()
		}
	}

	// Start server
	server := &http.Server{
		Addr:    serverAddress,
		Handler: router,
	}

	// Graceful shutdown
	go func() {
		log.Printf("Server listening on %s", serverAddress)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited properly")
}

// connectToMongoDB establishes a connection to MongoDB
func connectToMongoDB(uri string) (*mongo.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	// Ping the database to verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, err
	}

	log.Println("Connected to MongoDB")
	return client, nil
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}