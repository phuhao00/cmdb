package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AssetType represents the type of an asset
type AssetType string

// AssetStatus represents the status of an asset
type AssetStatus string

// Asset constants
const (
	// Asset Types
	ServerType      AssetType = "server"
	NetworkType     AssetType = "network"
	StorageType     AssetType = "storage"
	WorkstationType AssetType = "workstation"

	// Asset Statuses
	OnlineStatus        AssetStatus = "online"
	OfflineStatus       AssetStatus = "offline"
	MaintenanceStatus   AssetStatus = "maintenance"
	DecommissionedStatus AssetStatus = "decommissioned"
)

// Asset represents an IT asset in the CMDB domain
type Asset struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	AssetID     string             `json:"assetId" bson:"assetId"`
	Name        string             `json:"name" bson:"name"`
	Type        AssetType          `json:"type" bson:"type"`
	Status      AssetStatus        `json:"status" bson:"status"`
	Location    string             `json:"location" bson:"location"`
	Description string             `json:"description" bson:"description"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
}

// NewAsset creates a new asset with default values
func NewAsset(name string, assetType AssetType, location string, description string) *Asset {
	now := time.Now()
	return &Asset{
		Name:        name,
		Type:        assetType,
		Status:      OfflineStatus, // New assets start offline
		Location:    location,
		Description: description,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// SetStatus updates the asset status and updates the UpdatedAt timestamp
func (a *Asset) SetStatus(status AssetStatus) {
	a.Status = status
	a.UpdatedAt = time.Now()
}

// Update updates the asset fields and updates the UpdatedAt timestamp
func (a *Asset) Update(name string, location string, description string) {
	a.Name = name
	a.Location = location
	a.Description = description
	a.UpdatedAt = time.Now()
}

// IsDecommissioned checks if the asset is decommissioned
func (a *Asset) IsDecommissioned() bool {
	return a.Status == DecommissionedStatus
}

// IsOnline checks if the asset is online
func (a *Asset) IsOnline() bool {
	return a.Status == OnlineStatus
}

// IsOffline checks if the asset is offline
func (a *Asset) IsOffline() bool {
	return a.Status == OfflineStatus
}

// IsInMaintenance checks if the asset is in maintenance
func (a *Asset) IsInMaintenance() bool {
	return a.Status == MaintenanceStatus
}