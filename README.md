# CMDB - Configuration Management Database

A modern Configuration Management Database (CMDB) system with Feishu approval workflow integration.

## Features

- **Asset Management**: Track IT assets with detailed information
- **Workflow Approvals**: Integrated with Feishu for approval workflows
- **Real-time Dashboard**: Monitor asset status and pending approvals
- **Reporting**: Generate inventory, lifecycle, and compliance reports

## Tech Stack

- **Backend**: Go with Gin framework
- **Database**: MongoDB
- **Frontend**: HTML, CSS, JavaScript
- **Containerization**: Docker & Docker Compose

## Project Structure

```
cmdb/
├── backend/                    # Golang Backend API
│   ├── main.go                # Complete REST API with MongoDB
│   ├── go.mod                 # Go dependencies
│   ├── Dockerfile             # Backend containerization
│   ├── init-mongo.js          # Database initialization
│   └── README.md              # Backend documentation
├── frontend/                   # Web Frontend
│   ├── index.html             # Complete CMDB interface
│   ├── style.css              # Responsive design
│   ├── script.js              # API integration
│   └── README.md              # Frontend documentation
├── docker-compose.yml          # Multi-container setup
├── start.bat                   # Windows startup script
├── start.sh                    # Linux/Mac startup script
└── README.md                   # This documentation
```

## Getting Started

### Option 1: Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

This will start:
- MongoDB database on port 27017
- Backend API on port 8080
- Frontend on port 80 (using Nginx)

### Option 2: Manual Setup

#### Start MongoDB
```bash
docker run -d --name cmdb-mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -v $(pwd)/backend/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro \
  mongo:7.0
```

#### Start Backend API
```bash
cd backend
export MONGODB_URI="mongodb://admin:password123@localhost:27017/cmdb?authSource=admin"
go run main.go
```

#### Serve Frontend
```bash
# Using Python's built-in HTTP server
cd frontend
python -m http.server 80

# Or using Node.js http-server
cd frontend
npx http-server -p 80
```

## Access Points

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api/v1/*
- **MongoDB**: localhost:27017

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

## Feishu Integration

The system is designed to integrate with Feishu for approval workflows. In the current implementation, this integration is simulated. To connect to a real Feishu instance, you would need to:

1. Register an application in Feishu developer console
2. Configure approval workflows in Feishu
3. Update the `submitToFeishu` function in `backend/main.go` with actual API calls

## License

MIT