# CMDB Backend API

This is the backend API for the Configuration Management Database (CMDB) system, built with Go and the Gin framework.

## Features

- RESTful API for asset management
- MongoDB integration for data storage
- Workflow approval system with Feishu integration
- Report generation endpoints

## API Endpoints

### Assets
- `GET /api/v1/assets` - List assets
- `POST /api/v1/assets` - Create asset
- `PUT /api/v1/assets/:id` - Update asset
- `DELETE /api/v1/assets/:id` - Decommission asset
- `GET /api/v1/assets/stats` - Statistics

### Workflows
- `GET /api/v1/workflows` - List workflows
- `POST /api/v1/workflows` - Create workflow
- `PUT /api/v1/workflows/:id/approve` - Approve
- `PUT /api/v1/workflows/:id/reject` - Reject

### Reports
- `GET /api/v1/reports/inventory` - Inventory report
- `GET /api/v1/reports/lifecycle` - Lifecycle report
- `GET /api/v1/reports/compliance` - Compliance report

## Development

### Prerequisites

- Go 1.21 or higher
- MongoDB 7.0 or higher

### Setup

1. Install dependencies:
   ```
   go mod download
   ```

2. Set environment variables:
   ```
   export MONGODB_URI="mongodb://admin:password123@localhost:27017/cmdb?authSource=admin"
   export PORT=8080
   ```

3. Run the application:
   ```
   go run main.go
   ```

### Docker Build

```
docker build -t cmdb-api .
```

## Data Models

### Asset
```go
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
```

### Workflow
```go
type Workflow struct {
    ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
    WorkflowID  string             `json:"workflowId" bson:"workflowId"`
    Type        string             `json:"type" bson:"type"`
    AssetID     string             `json:"assetId" bson:"assetId"`
    AssetName   string             `json:"assetName" bson:"assetName"`
    Requester   string             `json:"requester" bson:"requester"`
    Priority    string             `json:"priority" bson:"priority"`
    Status      string             `json:"status" bson:"status"`
    Reason      string             `json:"reason" bson:"reason"`
    FeishuID    string             `json:"feishuId" bson:"feishuId"`
    CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
    UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
}