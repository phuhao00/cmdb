package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Asset represents an IT asset in the CMDB
type Asset struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	AssetID     string             `json:"assetId" bson:"assetId"`
	Name        string             `json:"name" bson:"name"`
	Type        string             `json:"type" bson:"type"`
	Status      string             `json:"status" bson:"status"`
	Location    string             `json:"location" bson:"location"`
	Description string             `json:"description" bson:"description"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
}

// Workflow represents an approval workflow
type Workflow struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	WorkflowID  string             `json:"workflowId" bson:"workflowId"`
	Type        string             `json:"type" bson:"type"`
	AssetID     string             `json:"assetId" bson:"assetId"`
	AssetName   string             `json:"assetName" bson:"assetName"`
	Requester   string             `json:"requester" bson:"requester"`
	Priority    string             `json:"priority" bson:"priority"`
	Status      string             `json:"status" bson:"status"` // pending, approved, rejected
	Reason      string             `json:"reason" bson:"reason"`
	FeishuID    string             `json:"feishuId" bson:"feishuId"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
}

// FeishuWebhook represents Feishu webhook payload
type FeishuWebhook struct {
	ApprovalCode string `json:"approval_code"`
	Status       string `json:"status"`
	WorkflowID   string `json:"workflow_id"`
}

// Database connection
var client *mongo.Client
var database *mongo.Database

// Collections
var assetsCollection *mongo.Collection
var workflowsCollection *mongo.Collection

func main() {
	// Initialize MongoDB connection
	initMongoDB()

	// Initialize Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Serve static files from frontend directory
	r.Static("/static", "../frontend")
	r.StaticFile("/", "../frontend/index.html")
	r.StaticFile("/style.css", "../frontend/style.css")
	r.StaticFile("/script.js", "../frontend/script.js")

	// API routes
	api := r.Group("/api/v1")
	{
		// Asset routes
		api.GET("/assets", getAssets)
		api.POST("/assets", createAsset)
		api.PUT("/assets/:id", updateAsset)
		api.DELETE("/assets/:id", deleteAsset)
		api.GET("/assets/stats", getAssetStats)

		// Workflow routes
		api.GET("/workflows", getWorkflows)
		api.POST("/workflows", createWorkflow)
		api.PUT("/workflows/:id/approve", approveWorkflow)
		api.PUT("/workflows/:id/reject", rejectWorkflow)

		// Feishu webhook
		api.POST("/feishu/webhook", handleFeishuWebhook)

		// Reports
		api.GET("/reports/inventory", getInventoryReport)
		api.GET("/reports/lifecycle", getLifecycleReport)
		api.GET("/reports/compliance", getComplianceReport)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(r.Run(":" + port))
}

func initMongoDB() {
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	clientOptions := options.Client().ApplyURI(mongoURI)
	var err error
	client, err = mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Test connection
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	database = client.Database("cmdb")
	assetsCollection = database.Collection("assets")
	workflowsCollection = database.Collection("workflows")

	log.Println("Connected to MongoDB successfully")

	// Create indexes
	createIndexes()
}

func createIndexes() {
	// Asset indexes
	assetsCollection.Indexes().CreateOne(context.TODO(), mongo.IndexModel{
		Keys: bson.D{{Key: "assetId", Value: 1}},
		Options: options.Index().SetUnique(true),
	})

	// Workflow indexes
	workflowsCollection.Indexes().CreateOne(context.TODO(), mongo.IndexModel{
		Keys: bson.D{{Key: "workflowId", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
}

// Asset handlers
func getAssets(c *gin.Context) {
	var assets []Asset
	
	// Build filter
	filter := bson.M{}
	if status := c.Query("status"); status != "" {
		filter["status"] = status
	}
	if assetType := c.Query("type"); assetType != "" {
		filter["type"] = assetType
	}
	if search := c.Query("search"); search != "" {
		filter["$or"] = []bson.M{
			{"name": bson.M{"$regex": search, "$options": "i"}},
			{"assetId": bson.M{"$regex": search, "$options": "i"}},
			{"location": bson.M{"$regex": search, "$options": "i"}},
		}
	}

	cursor, err := assetsCollection.Find(context.TODO(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(context.TODO())

	if err = cursor.All(context.TODO(), &assets); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, assets)
}

func createAsset(c *gin.Context) {
	var asset Asset
	if err := c.ShouldBindJSON(&asset); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate asset ID
	asset.AssetID = generateAssetID(asset.Type)
	asset.Status = "offline" // New assets start offline
	asset.CreatedAt = time.Now()
	asset.UpdatedAt = time.Now()

	result, err := assetsCollection.InsertOne(context.TODO(), asset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	asset.ID = result.InsertedID.(primitive.ObjectID)

	// Create approval workflow
	workflow := Workflow{
		WorkflowID: generateWorkflowID(),
		Type:       "Asset Onboarding",
		AssetID:    asset.AssetID,
		AssetName:  asset.Name,
		Requester:  "System User",
		Priority:   "medium",
		Status:     "pending",
		Reason:     "New asset registration",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Submit to Feishu (simulated)
	feishuID := submitToFeishu(workflow)
	workflow.FeishuID = feishuID

	workflowsCollection.InsertOne(context.TODO(), workflow)

	c.JSON(http.StatusCreated, gin.H{
		"asset":    asset,
		"workflow": workflow,
		"message":  "Asset created and submitted for approval",
	})
}

func updateAsset(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid asset ID"})
		return
	}

	var updateData bson.M
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updateData["updatedAt"] = time.Now()

	result, err := assetsCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": id},
		bson.M{"$set": updateData},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Asset updated successfully"})
}

func deleteAsset(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid asset ID"})
		return
	}

	// Get asset details first
	var asset Asset
	err = assetsCollection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&asset)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found"})
		return
	}

	// Create decommission workflow instead of direct deletion
	workflow := Workflow{
		WorkflowID: generateWorkflowID(),
		Type:       "Asset Decommission",
		AssetID:    asset.AssetID,
		AssetName:  asset.Name,
		Requester:  "System User",
		Priority:   "medium",
		Status:     "pending",
		Reason:     "Asset decommission request",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	feishuID := submitToFeishu(workflow)
	workflow.FeishuID = feishuID

	workflowsCollection.InsertOne(context.TODO(), workflow)

	c.JSON(http.StatusOK, gin.H{
		"message":  "Decommission workflow created",
		"workflow": workflow,
	})
}

func getAssetStats(c *gin.Context) {
	pipeline := []bson.M{
		{
			"$group": bson.M{
				"_id":   "$status",
				"count": bson.M{"$sum": 1},
			},
		},
	}

	cursor, err := assetsCollection.Aggregate(context.TODO(), pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(context.TODO())

	var results []bson.M
	if err = cursor.All(context.TODO(), &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	stats := map[string]int{
		"total":   0,
		"online":  0,
		"offline": 0,
		"maintenance": 0,
		"decommissioned": 0,
	}

	for _, result := range results {
		status := result["_id"].(string)
		count := int(result["count"].(int32))
		stats[status] = count
		stats["total"] += count
	}

	// Get pending workflows count
	pendingCount, _ := workflowsCollection.CountDocuments(context.TODO(), bson.M{"status": "pending"})
	stats["pending"] = int(pendingCount)

	c.JSON(http.StatusOK, stats)
}

// Workflow handlers
func getWorkflows(c *gin.Context) {
	var workflows []Workflow
	
	filter := bson.M{}
	if status := c.Query("status"); status != "" {
		filter["status"] = status
	}

	cursor, err := workflowsCollection.Find(context.TODO(), filter, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(context.TODO())

	if err = cursor.All(context.TODO(), &workflows); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, workflows)
}

func createWorkflow(c *gin.Context) {
	var workflow Workflow
	if err := c.ShouldBindJSON(&workflow); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	workflow.WorkflowID = generateWorkflowID()
	workflow.Status = "pending"
	workflow.CreatedAt = time.Now()
	workflow.UpdatedAt = time.Now()

	// Submit to Feishu
	feishuID := submitToFeishu(workflow)
	workflow.FeishuID = feishuID

	result, err := workflowsCollection.InsertOne(context.TODO(), workflow)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	workflow.ID = result.InsertedID.(primitive.ObjectID)
	c.JSON(http.StatusCreated, workflow)
}

func approveWorkflow(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid workflow ID"})
		return
	}

	// Get workflow details
	var workflow Workflow
	err = workflowsCollection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&workflow)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Workflow not found"})
		return
	}

	// Update workflow status
	workflowsCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": id},
		bson.M{"$set": bson.M{"status": "approved", "updatedAt": time.Now()}},
	)

	// Execute the approved action
	executeApprovedAction(workflow)

	c.JSON(http.StatusOK, gin.H{"message": "Workflow approved and executed"})
}

func rejectWorkflow(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid workflow ID"})
		return
	}

	result, err := workflowsCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": id},
		bson.M{"$set": bson.M{"status": "rejected", "updatedAt": time.Now()}},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Workflow not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Workflow rejected"})
}

func handleFeishuWebhook(c *gin.Context) {
	var webhook FeishuWebhook
	if err := c.ShouldBindJSON(&webhook); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find workflow by Feishu ID
	var workflow Workflow
	err := workflowsCollection.FindOne(context.TODO(), bson.M{"feishuId": webhook.WorkflowID}).Decode(&workflow)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Workflow not found"})
		return
	}

	// Update workflow status based on Feishu response
	status := "pending"
	if webhook.Status == "approved" {
		status = "approved"
		executeApprovedAction(workflow)
	} else if webhook.Status == "rejected" {
		status = "rejected"
	}

	workflowsCollection.UpdateOne(
		context.TODO(),
		bson.M{"feishuId": webhook.WorkflowID},
		bson.M{"$set": bson.M{"status": status, "updatedAt": time.Now()}},
	)

	c.JSON(http.StatusOK, gin.H{"message": "Webhook processed successfully"})
}

// Report handlers
func getInventoryReport(c *gin.Context) {
	var assets []Asset
	cursor, err := assetsCollection.Find(context.TODO(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(context.TODO())

	if err = cursor.All(context.TODO(), &assets); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=inventory-report.csv")
	
	csvData := "Asset ID,Name,Type,Status,Location,Created At,Updated At\n"
	for _, asset := range assets {
		csvData += fmt.Sprintf("%s,%s,%s,%s,%s,%s,%s\n",
			asset.AssetID, asset.Name, asset.Type, asset.Status, asset.Location,
			asset.CreatedAt.Format("2006-01-02 15:04:05"),
			asset.UpdatedAt.Format("2006-01-02 15:04:05"))
	}

	c.String(http.StatusOK, csvData)
}

func getLifecycleReport(c *gin.Context) {
	// Implementation for lifecycle report
	c.JSON(http.StatusOK, gin.H{"message": "Lifecycle report generated"})
}

func getComplianceReport(c *gin.Context) {
	// Implementation for compliance report
	c.JSON(http.StatusOK, gin.H{"message": "Compliance report generated"})
}

// Helper functions
func generateAssetID(assetType string) string {
	prefix := map[string]string{
		"server":      "SRV",
		"network":     "NET",
		"storage":     "STG",
		"workstation": "WS",
	}

	typePrefix := prefix[assetType]
	if typePrefix == "" {
		typePrefix = "AST"
	}

	// Get count of assets of this type
	count, _ := assetsCollection.CountDocuments(context.TODO(), bson.M{"type": assetType})
	return fmt.Sprintf("%s-%03d", typePrefix, count+1)
}

func generateWorkflowID() string {
	return fmt.Sprintf("WF-%d", time.Now().Unix())
}

func submitToFeishu(workflow Workflow) string {
	// Simulate Feishu API call
	// In real implementation, this would make HTTP request to Feishu API
	log.Printf("🚀 Submitting workflow to Feishu: %s - %s", workflow.Type, workflow.AssetName)
	
	// Return simulated Feishu workflow ID
	return fmt.Sprintf("FEISHU-%d", time.Now().Unix())
}

func executeApprovedAction(workflow Workflow) {
	switch workflow.Type {
	case "Asset Onboarding":
		assetsCollection.UpdateOne(
			context.TODO(),
			bson.M{"assetId": workflow.AssetID},
			bson.M{"$set": bson.M{"status": "online", "updatedAt": time.Now()}},
		)
	case "Asset Decommission":
		assetsCollection.UpdateOne(
			context.TODO(),
			bson.M{"assetId": workflow.AssetID},
			bson.M{"$set": bson.M{"status": "decommissioned", "updatedAt": time.Now()}},
		)
	case "Status Change":
		// Toggle status logic would be implemented here
		assetsCollection.UpdateOne(
			context.TODO(),
			bson.M{"assetId": workflow.AssetID},
			bson.M{"$set": bson.M{"updatedAt": time.Now()}},
		)
	case "Maintenance Request":
		assetsCollection.UpdateOne(
			context.TODO(),
			bson.M{"assetId": workflow.AssetID},
			bson.M{"$set": bson.M{"status": "maintenance", "updatedAt": time.Now()}},
		)
	}
}