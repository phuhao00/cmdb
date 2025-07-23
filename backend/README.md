# CMDB Backend API

Golang backend service for the Configuration Management Database (CMDB) system.

## Features

- RESTful API with Gin framework
- MongoDB integration
- Asset lifecycle management
- Workflow management system
- Feishu webhook integration
- Report generation endpoints
- Docker containerization

## API Endpoints

### Assets
- `GET /api/v1/assets` - List all assets
- `POST /api/v1/assets` - Create new asset
- `PUT /api/v1/assets/:id` - Update asset
- `DELETE /api/v1/assets/:id` - Decommission asset
- `GET /api/v1/assets/stats` - Get asset statistics

### Workflows
- `GET /api/v1/workflows` - List workflows
- `POST /api/v1/workflows` - Create workflow
- `PUT /api/v1/workflows/:id/approve` - Approve workflow
- `PUT /api/v1/workflows/:id/reject` - Reject workflow

### Reports
- `GET /api/v1/reports/inventory` - Generate inventory report
- `GET /api/v1/reports/lifecycle` - Generate lifecycle report
- `GET /api/v1/reports/compliance` - Generate compliance report

### Feishu Integration
- `POST /api/v1/feishu/webhook` - Feishu webhook endpoint

## Environment Variables

- `MONGODB_URI` - MongoDB connection string (default: mongodb://localhost:27017)
- `PORT` - Server port (default: 8080)

## Development

```bash
# Install dependencies
go mod tidy

# Run the server
go run main.go
```

## Docker

```bash
# Build image
docker build -t cmdb-backend .

# Run container
docker run -p 8080:8080 -e MONGODB_URI=mongodb://localhost:27017 cmdb-backend