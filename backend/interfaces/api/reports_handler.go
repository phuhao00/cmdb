package api

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/phuhao00/cmdb/backend/application"
)

// ReportsHandler handles HTTP requests for reports
type ReportsHandler struct {
	assetApp    *application.AssetApplication
	workflowApp *application.WorkflowApplication
}

// NewReportsHandler creates a new reports handler
func NewReportsHandler(assetApp *application.AssetApplication, workflowApp *application.WorkflowApplication) *ReportsHandler {
	return &ReportsHandler{
		assetApp:    assetApp,
		workflowApp: workflowApp,
	}
}

// RegisterRoutes registers the reports routes
func (h *ReportsHandler) RegisterRoutes(router *gin.RouterGroup) {
	reports := router.Group("/reports")
	{
		reports.GET("/inventory", h.GenerateInventoryReport)
		reports.GET("/lifecycle", h.GenerateLifecycleReport)
		reports.GET("/compliance", h.GenerateComplianceReport)
	}
}

// GenerateInventoryReport generates an inventory report
func (h *ReportsHandler) GenerateInventoryReport(c *gin.Context) {
	// Get all assets
	assets, err := h.assetApp.GetAssets(c.Request.Context(), application.AssetFilterDTO{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Set response headers for CSV download
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=inventory-report-%s.csv", time.Now().Format("2006-01-02")))

	// Create CSV writer
	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	// Write CSV headers
	headers := []string{"Asset ID", "Name", "Type", "Status", "Location", "Description", "Created At", "Updated At"}
	if err := writer.Write(headers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write CSV headers"})
		return
	}

	// Write asset data
	for _, asset := range assets {
		record := []string{
			asset.AssetID,
			asset.Name,
			asset.Type,
			asset.Status,
			asset.Location,
			asset.Description,
			asset.CreatedAt.Format("2006-01-02 15:04:05"),
			asset.UpdatedAt.Format("2006-01-02 15:04:05"),
		}
		if err := writer.Write(record); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write CSV record"})
			return
		}
	}
}

// GenerateLifecycleReport generates a lifecycle report
func (h *ReportsHandler) GenerateLifecycleReport(c *gin.Context) {
	// Get all assets
	assets, err := h.assetApp.GetAssets(c.Request.Context(), application.AssetFilterDTO{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Set response headers for CSV download
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=lifecycle-report-%s.csv", time.Now().Format("2006-01-02")))

	// Create CSV writer
	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	// Write CSV headers
	headers := []string{"Asset ID", "Name", "Type", "Status", "Age (Days)", "Last Updated", "Lifecycle Stage"}
	if err := writer.Write(headers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write CSV headers"})
		return
	}

	// Write asset data with lifecycle information
	for _, asset := range assets {
		age := int(time.Since(asset.CreatedAt).Hours() / 24)
		lifecycleStage := getLifecycleStage(asset.Status, age)

		record := []string{
			asset.AssetID,
			asset.Name,
			asset.Type,
			asset.Status,
			strconv.Itoa(age),
			asset.UpdatedAt.Format("2006-01-02 15:04:05"),
			lifecycleStage,
		}
		if err := writer.Write(record); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write CSV record"})
			return
		}
	}
}

// GenerateComplianceReport generates a compliance report
func (h *ReportsHandler) GenerateComplianceReport(c *gin.Context) {
	// Get all assets
	assets, err := h.assetApp.GetAssets(c.Request.Context(), application.AssetFilterDTO{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get all workflows
	workflows, err := h.workflowApp.GetWorkflows(c.Request.Context(), application.WorkflowFilterDTO{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Set response headers for CSV download
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=compliance-report-%s.csv", time.Now().Format("2006-01-02")))

	// Create CSV writer
	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	// Write CSV headers
	headers := []string{"Asset ID", "Name", "Type", "Status", "Compliance Status", "Pending Workflows", "Last Workflow", "Risk Level"}
	if err := writer.Write(headers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write CSV headers"})
		return
	}

	// Create workflow map for quick lookup
	workflowMap := make(map[string][]*application.WorkflowDTO)
	for _, workflow := range workflows {
		workflowMap[workflow.AssetID] = append(workflowMap[workflow.AssetID], workflow)
	}

	// Write asset compliance data
	for _, asset := range assets {
		assetWorkflows := workflowMap[asset.AssetID]
		pendingCount := 0
		var lastWorkflow *application.WorkflowDTO

		for _, workflow := range assetWorkflows {
			if workflow.Status == "pending" {
				pendingCount++
			}
			if lastWorkflow == nil || workflow.CreatedAt.After(lastWorkflow.CreatedAt) {
				lastWorkflow = workflow
			}
		}

		complianceStatus := getComplianceStatus(asset.Status, pendingCount)
		riskLevel := getRiskLevel(asset.Status, pendingCount, asset.UpdatedAt)
		lastWorkflowDate := "N/A"
		if lastWorkflow != nil {
			lastWorkflowDate = lastWorkflow.CreatedAt.Format("2006-01-02 15:04:05")
		}

		record := []string{
			asset.AssetID,
			asset.Name,
			asset.Type,
			asset.Status,
			complianceStatus,
			strconv.Itoa(pendingCount),
			lastWorkflowDate,
			riskLevel,
		}
		if err := writer.Write(record); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write CSV record"})
			return
		}
	}
}

// Helper functions

func getLifecycleStage(status string, age int) string {
	switch status {
	case "online":
		if age < 30 {
			return "New"
		} else if age < 365 {
			return "Active"
		} else {
			return "Mature"
		}
	case "offline":
		return "Inactive"
	case "maintenance":
		return "Under Maintenance"
	case "decommissioned":
		return "End of Life"
	default:
		return "Unknown"
	}
}

func getComplianceStatus(status string, pendingWorkflows int) string {
	if status == "decommissioned" {
		return "Compliant"
	}
	if pendingWorkflows > 0 {
		return "Pending Review"
	}
	if status == "online" {
		return "Compliant"
	}
	return "Non-Compliant"
}

func getRiskLevel(status string, pendingWorkflows int, lastUpdated time.Time) string {
	daysSinceUpdate := int(time.Since(lastUpdated).Hours() / 24)

	if status == "decommissioned" {
		return "Low"
	}
	if pendingWorkflows > 2 {
		return "High"
	}
	if daysSinceUpdate > 90 {
		return "Medium"
	}
	if status == "offline" && daysSinceUpdate > 30 {
		return "Medium"
	}
	return "Low"
}
