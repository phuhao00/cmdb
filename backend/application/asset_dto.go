package application

// AssetStatsDTO represents asset statistics data transfer object
type AssetStatsDTO struct {
	Total          int `json:"total"`
	Online         int `json:"online"`
	Offline        int `json:"offline"`
	Maintenance    int `json:"maintenance"`
	Decommissioned int `json:"decommissioned"`
	Pending        int `json:"pending"`
} 