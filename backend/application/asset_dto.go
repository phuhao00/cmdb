package application

import "time"

// AssetStatsDTO represents asset statistics data transfer object
type AssetStatsDTO struct {
	Total          int `json:"total"`
	Online         int `json:"online"`
	Offline        int `json:"offline"`
	Maintenance    int `json:"maintenance"`
	Decommissioned int `json:"decommissioned"`
	Pending        int `json:"pending"`
}

// AssetSearchDTO represents search criteria for assets
type AssetSearchDTO struct {
	Query      string   `json:"query"`
	Type       string   `json:"type"`
	Status     string   `json:"status"`
	Location   string   `json:"location"`
	Department string   `json:"department"`
	Owner      string   `json:"owner"`
	Tags       []string `json:"tags"`
	IPAddress  string   `json:"ipAddress"`
	SortBy     string   `json:"sortBy"`
	SortOrder  string   `json:"sortOrder"`
	Page       int      `json:"page"`
	Limit      int      `json:"limit"`
}

// AssetTagDTO represents tag operations for assets
type AssetTagDTO struct {
	Tags []string `json:"tags"`
}

// AssetUpdateDTO represents update fields for assets
type AssetUpdateDTO struct {
	Name        string `json:"name"`
	Location    string `json:"location"`
	Description string `json:"description"`
	Requester   string `json:"requester,omitempty"`
	RequesterID string `json:"requesterId,omitempty"`
}

// AssetBulkUpdateDTO represents bulk update fields for assets
type AssetBulkUpdateDTO struct {
	Name        string   `json:"name"`
	Location    string   `json:"location"`
	Description string   `json:"description"`
	Department  string   `json:"department"`
	Owner       string   `json:"owner"`
	IPAddress   string   `json:"ipAddress"`
	Tags        []string `json:"tags"`
}

// AssetScanDTO represents asset scan information
type AssetScanDTO struct {
	AssetID     string    `json:"assetId"`
	IPAddress   string    `json:"ipAddress"`
	Status      string    `json:"status"`
	LastScanned time.Time `json:"lastScanned"`
}

// AssetExportDTO represents asset data for export
type AssetExportDTO struct {
	AssetID       string    `json:"assetId"`
	Name          string    `json:"name"`
	Type          string    `json:"type"`
	Status        string    `json:"status"`
	Location      string    `json:"location"`
	Department    string    `json:"department"`
	Owner         string    `json:"owner"`
	IPAddress     string    `json:"ipAddress"`
	Tags          []string  `json:"tags"`
	PurchasePrice float64   `json:"purchasePrice"`
	AnnualCost    float64   `json:"annualCost"`
	Currency      string    `json:"currency"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}
