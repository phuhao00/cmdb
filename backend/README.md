# CMDB Backend API

This is the backend API for the Configuration Management Database (CMDB) system, built with Go and the Gin framework.

## Features

- RESTful API for asset management
- MongoDB integration for data storage
- Workflow approval system with Feishu integration
- Report generation endpoints
- Service discovery with Consul
- CORS support
- Graceful shutdown

## API Endpoints

### Assets
- `GET /api/v1/assets` - List assets
- `POST /api/v1/assets` - Create asset
- `PUT /api/v1/assets/:id` - Update asset
- `DELETE /api/v1/assets/:id` - Decommission asset
- `GET /api/v1/assets/stats` - Statistics
- `GET /api/v1/assets/types` - Get asset types distribution
- `GET /api/v1/assets/locations` - Get asset locations distribution
- `GET /api/v1/assets/costs` - Get asset cost summary
- `GET /api/v1/assets/critical` - Get critical assets
- `PUT /api/v1/assets/:id/costs` - Update asset costs

### Workflows
- `GET /api/v1/workflows` - List workflows
- `POST /api/v1/workflows` - Create workflow
- `PUT /api/v1/workflows/:id/approve` - Approve
- `PUT /api/v1/workflows/:id/reject` - Reject
- `GET /api/v1/workflows/stats` - Get workflow statistics

### Reports
- `GET /api/v1/reports/inventory` - Inventory report
- `GET /api/v1/reports/lifecycle` - Lifecycle report
- `GET /api/v1/reports/compliance` - Compliance report

### Health
- `GET /health` - Health check endpoint

## Database Initialization

When the MongoDB container starts for the first time, it automatically initializes the database with sample data using the [init-mongo.js](file:///c:/Users/HHaou/cmdb/backend/init-mongo.js) script:

- Asset collections with proper indexes
- Workflow collections with proper indexes
- Sample assets (16 items) across different categories:
  - Servers (web, database, application)
  - Network equipment (switches, routers, firewalls)
  - Storage systems (SAN, NAS)
  - Workstations
- Sample workflows (8 items) with various statuses:
  - Approved workflows
  - Pending workflows
  - Rejected workflows

All sample data includes realistic information such as:
- Asset IDs with proper prefixes (SRV-, NET-, STG-, WS-)
- Descriptive names and locations
- Cost information (purchase price, annual cost)
- Realistic timestamps

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
   export CONSUL_ADDRESS="localhost:8500"
   export PORT=8081
   ```

3. Run the application:
   ```
   go run main.go
   ```

### Docker Build

```
docker build -t cmdb-api .
```

## Project Structure

```
backend/
├── application/           # Application services
├── domain/                # Domain layer (models, services, repositories)
│   ├── model/             # Domain models
│   ├── repository/        # Repository interfaces
│   └── service/           # Domain services
├── infrastructure/        # Infrastructure layer
│   ├── consul/            # Consul client
│   └── persistence/       # Database implementations
├── interfaces/            # Interface adapters
│   └── api/               # REST API handlers
├── init-mongo.js          # MongoDB initialization script
├── main.go                # Application entry point
├── Dockerfile             # Docker configuration
└── go.mod                 # Go module definition
```

## Clean Architecture

The backend follows Clean Architecture principles with a clear separation of concerns:

1. **Domain Layer**: Contains business logic and domain models
2. **Application Layer**: Implements application-specific business rules
3. **Infrastructure Layer**: Provides implementations for external concerns (database, service discovery)
4. **Interface Layer**: Adapts data from external sources to the application

This architecture makes the system:
- Testable
- Independent of frameworks
- Independent of the database
- Independent of the UI
- Independent of external agencies

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
    // Cost tracking fields
    PurchasePrice float64          `json:"purchasePrice" bson:"purchasePrice"`
    AnnualCost    float64          `json:"annualCost" bson:"annualCost"`
    Currency      string           `json:"currency" bson:"currency"`
    CreatedAt     time.Time        `json:"createdAt" bson:"createdAt"`
    UpdatedAt     time.Time        `json:"updatedAt" bson:"updatedAt"`
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
```