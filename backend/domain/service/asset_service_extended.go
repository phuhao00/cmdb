package service

import (
	"context"

	"github.com/phuhao00/cmdb/backend/domain/model"
)

// AssetSearchCriteria defines search criteria for assets
type AssetSearchCriteria struct {
	Query      string
	Type       string
	Status     string
	Location   string
	Department string
	Owner      string
	Tags       []string
	IPAddress  string
	SortBy     string
	SortOrder  string
	Page       int
	Limit      int
}

// SearchAssets performs advanced search on assets
func (s *AssetService) SearchAssets(ctx context.Context, criteria AssetSearchCriteria) ([]*model.Asset, error) {
	// Build filter
	filter := make(map[string]interface{})

	if criteria.Type != "" {
		filter["type"] = criteria.Type
	}
	if criteria.Status != "" {
		filter["status"] = criteria.Status
	}
	if criteria.Location != "" {
		filter["location"] = criteria.Location
	}
	if criteria.Department != "" {
		filter["department"] = criteria.Department
	}
	if criteria.Owner != "" {
		filter["owner"] = criteria.Owner
	}
	if criteria.IPAddress != "" {
		filter["ipAddress"] = criteria.IPAddress
	}

	// TODO: Implement full text search and tag filtering in repository
	return s.assetRepo.FindAll(ctx, filter)
}

// CountAssets counts assets matching the criteria
func (s *AssetService) CountAssets(ctx context.Context, criteria AssetSearchCriteria) (int64, error) {
	// Build filter
	filter := make(map[string]interface{})

	if criteria.Type != "" {
		filter["type"] = criteria.Type
	}
	if criteria.Status != "" {
		filter["status"] = criteria.Status
	}
	if criteria.Location != "" {
		filter["location"] = criteria.Location
	}
	if criteria.Department != "" {
		filter["department"] = criteria.Department
	}
	if criteria.Owner != "" {
		filter["owner"] = criteria.Owner
	}

	// TODO: Implement count with filter in repository
	return s.assetRepo.Count(ctx, filter)
}

// GetAllTags retrieves all unique tags across all assets
func (s *AssetService) GetAllTags(ctx context.Context) ([]string, error) {
	assets, err := s.assetRepo.FindAll(ctx, map[string]interface{}{})
	if err != nil {
		return nil, err
	}

	tagMap := make(map[string]bool)
	for _, asset := range assets {
		for _, tag := range asset.Tags {
			tagMap[tag] = true
		}
	}

	tags := make([]string, 0, len(tagMap))
	for tag := range tagMap {
		tags = append(tags, tag)
	}

	return tags, nil
}

// GetDepartments retrieves all unique departments
func (s *AssetService) GetDepartments(ctx context.Context) ([]string, error) {
	assets, err := s.assetRepo.FindAll(ctx, map[string]interface{}{})
	if err != nil {
		return nil, err
	}

	deptMap := make(map[string]bool)
	for _, asset := range assets {
		if asset.Department != "" {
			deptMap[asset.Department] = true
		}
	}

	departments := make([]string, 0, len(deptMap))
	for dept := range deptMap {
		departments = append(departments, dept)
	}

	return departments, nil
}

// GetOwners retrieves all unique owners
func (s *AssetService) GetOwners(ctx context.Context) ([]string, error) {
	assets, err := s.assetRepo.FindAll(ctx, map[string]interface{}{})
	if err != nil {
		return nil, err
	}

	ownerMap := make(map[string]bool)
	for _, asset := range assets {
		if asset.Owner != "" {
			ownerMap[asset.Owner] = true
		}
	}

	owners := make([]string, 0, len(ownerMap))
	for owner := range ownerMap {
		owners = append(owners, owner)
	}

	return owners, nil
}

// SaveAsset saves an asset (create or update)
func (s *AssetService) SaveAsset(ctx context.Context, asset *model.Asset) error {
	return s.assetRepo.Save(ctx, asset)
}
