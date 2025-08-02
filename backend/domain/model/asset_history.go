package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AssetHistory represents a historical record of asset changes
type AssetHistory struct {
	ID            primitive.ObjectID     `json:"id" bson:"_id,omitempty"`
	AssetID       primitive.ObjectID     `json:"assetId" bson:"assetId"`
	AssetName     string                 `json:"assetName" bson:"assetName"`
	ChangeType    string                 `json:"changeType" bson:"changeType"`
	ChangedBy     string                 `json:"changedBy" bson:"changedBy"`
	ChangedByID   string                 `json:"changedById" bson:"changedById"`
	FieldChanges  []FieldChange          `json:"fieldChanges" bson:"fieldChanges"`
	OldValues     map[string]interface{} `json:"oldValues" bson:"oldValues"`
	NewValues     map[string]interface{} `json:"newValues" bson:"newValues"`
	ChangeReason  string                 `json:"changeReason" bson:"changeReason"`
	Timestamp     time.Time              `json:"timestamp" bson:"timestamp"`
}

// FieldChange represents a single field change
type FieldChange struct {
	FieldName string      `json:"fieldName" bson:"fieldName"`
	OldValue  interface{} `json:"oldValue" bson:"oldValue"`
	NewValue  interface{} `json:"newValue" bson:"newValue"`
}

// ChangeType constants
const (
	ChangeTypeCreate         = "create"
	ChangeTypeUpdate         = "update"
	ChangeTypeStatusChange   = "status_change"
	ChangeTypeOwnerChange    = "owner_change"
	ChangeTypeDepartmentChange = "department_change"
	ChangeTypeTagsUpdate     = "tags_update"
	ChangeTypeCostUpdate     = "cost_update"
	ChangeTypeDelete         = "delete"
)

// NewAssetHistory creates a new asset history record
func NewAssetHistory(assetID primitive.ObjectID, assetName, changeType, changedBy, changedByID, changeReason string) *AssetHistory {
	return &AssetHistory{
		ID:           primitive.NewObjectID(),
		AssetID:      assetID,
		AssetName:    assetName,
		ChangeType:   changeType,
		ChangedBy:    changedBy,
		ChangedByID:  changedByID,
		FieldChanges: make([]FieldChange, 0),
		OldValues:    make(map[string]interface{}),
		NewValues:    make(map[string]interface{}),
		ChangeReason: changeReason,
		Timestamp:    time.Now(),
	}
}

// AddFieldChange adds a field change to the history record
func (h *AssetHistory) AddFieldChange(fieldName string, oldValue, newValue interface{}) {
	h.FieldChanges = append(h.FieldChanges, FieldChange{
		FieldName: fieldName,
		OldValue:  oldValue,
		NewValue:  newValue,
	})
	h.OldValues[fieldName] = oldValue
	h.NewValues[fieldName] = newValue
}

// CompareAssets compares two assets and records the differences
func (h *AssetHistory) CompareAssets(oldAsset, newAsset *Asset) {
	// Compare basic fields
	if oldAsset.Name != newAsset.Name {
		h.AddFieldChange("name", oldAsset.Name, newAsset.Name)
	}
	if oldAsset.Type != newAsset.Type {
		h.AddFieldChange("type", string(oldAsset.Type), string(newAsset.Type))
	}
	if oldAsset.Status != newAsset.Status {
		h.AddFieldChange("status", string(oldAsset.Status), string(newAsset.Status))
	}
	if oldAsset.Location != newAsset.Location {
		h.AddFieldChange("location", oldAsset.Location, newAsset.Location)
	}
	if oldAsset.Description != newAsset.Description {
		h.AddFieldChange("description", oldAsset.Description, newAsset.Description)
	}
	if oldAsset.Department != newAsset.Department {
		h.AddFieldChange("department", oldAsset.Department, newAsset.Department)
	}
	if oldAsset.Owner != newAsset.Owner {
		h.AddFieldChange("owner", oldAsset.Owner, newAsset.Owner)
	}
	if oldAsset.IPAddress != newAsset.IPAddress {
		h.AddFieldChange("ipAddress", oldAsset.IPAddress, newAsset.IPAddress)
	}
	
	// Compare cost fields
	if oldAsset.PurchasePrice != newAsset.PurchasePrice {
		h.AddFieldChange("purchasePrice", oldAsset.PurchasePrice, newAsset.PurchasePrice)
	}
	if oldAsset.AnnualCost != newAsset.AnnualCost {
		h.AddFieldChange("annualCost", oldAsset.AnnualCost, newAsset.AnnualCost)
	}
	if oldAsset.Currency != newAsset.Currency {
		h.AddFieldChange("currency", oldAsset.Currency, newAsset.Currency)
	}
	
	// Compare tags
	if !equalStringSlices(oldAsset.Tags, newAsset.Tags) {
		h.AddFieldChange("tags", oldAsset.Tags, newAsset.Tags)
	}
}

// equalStringSlices compares two string slices for equality
func equalStringSlices(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i, v := range a {
		if v != b[i] {
			return false
		}
	}
	return true
}

// GetChangeDescription returns a human-readable description of the change
func (h *AssetHistory) GetChangeDescription() string {
	switch h.ChangeType {
	case ChangeTypeCreate:
		return "资产创建"
	case ChangeTypeUpdate:
		return "资产信息更新"
	case ChangeTypeStatusChange:
		return "状态变更"
	case ChangeTypeOwnerChange:
		return "负责人变更"
	case ChangeTypeDepartmentChange:
		return "部门变更"
	case ChangeTypeTagsUpdate:
		return "标签更新"
	case ChangeTypeCostUpdate:
		return "成本信息更新"
	case ChangeTypeDelete:
		return "资产删除"
	default:
		return "其他变更"
	}
}