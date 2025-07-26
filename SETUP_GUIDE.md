# CMDB Setup Guide

This guide provides step-by-step instructions to set up and run the CMDB (Configuration Management Database) system.

## Prerequisites

### Required Software
1. **Go** (version 1.21 or later)
   - Download from: https://golang.org/dl/
   - Verify installation: `go version`

2. **Node.js** (version 14 or later)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

3. **MongoDB** (version 7.0 or later)
   - Option 1: Install locally from https://www.mongodb.com/try/download/community
   - Option 2: Use Docker: `docker run -d --name mongodb -p 27017:27017 mongo:7.0`

4. **Docker** (optional, for containerized deployment)
   - Download from: https://www.docker.com/get-started

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Clone and navigate to the project directory**
   ```bash
   cd cmdb
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:8080/api/v1
   - MongoDB: localhost:27017
   - Consul UI: http://localhost:8500

### Option 2: Manual Setup

1. **Install Node.js dependencies**
   ```bash
   npm install
   ```

2. **Install Go dependencies**
   ```bash
   cd backend
   go mod tidy
   cd ..
   ```

3. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d --name cmdb-mongodb -p 27017:27017 \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=password123 \
     -v "$(pwd)/backend/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro" \
     mongo:7.0
   
   # Or start your local MongoDB instance
   mongod --dbpath /path/to/your/db
   ```

4. **Start the Backend API**
   ```bash
   cd backend
   export MONGODB_URI="mongodb://admin:password123@localhost:27017/cmdb?authSource=admin"
   # Or for local MongoDB without auth:
   # export MONGODB_URI="mongodb://localhost:27017/cmdb"
   export PORT=8080
   go run main.go
   ```

5. **Start the Frontend Server** (in a new terminal)
   ```bash
   export BACKEND_HOST="localhost"
   export BACKEND_PORT=8080
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8080/api/v1

### Option 3: Using Startup Scripts

#### Windows
```cmd
# For full setup with Docker
start.bat

# For simple setup (requires MongoDB running locally)
start-simple.bat
```

#### Linux/Mac
```bash
# For full setup with Docker
./start.sh

# For simple setup (requires MongoDB running locally)
./start-simple.sh
```

## Project Structure

```
cmdb/
├── backend/                    # Go Backend API
│   ├── main.go                # Main application entry point
│   ├── go.mod                 # Go dependencies
│   ├── Dockerfile             # Backend containerization
│   ├── init-mongo.js          # Database initialization
│   ├── application/           # Application layer (DTOs, use cases)
│   ├── domain/                # Domain layer (models, services, repositories)
│   ├── infrastructure/        # Infrastructure layer (MongoDB, Consul)
│   └── interfaces/            # Interface layer (HTTP handlers)
├── frontend/                   # Web Frontend
│   ├── index.html             # Main HTML file
│   ├── style.css              # Styles
│   ├── script.js              # Main JavaScript
│   └── dashboard.js           # Dashboard functionality
├── docker-compose.yml          # Multi-container setup
├── package.json               # Node.js dependencies
├── server.js                  # Frontend server with API proxy
└── README.md                  # Project documentation
```

## API Endpoints

### Assets
- `GET /api/v1/assets` - List all assets
- `POST /api/v1/assets` - Create new asset
- `GET /api/v1/assets/:id` - Get asset by ID
- `PUT /api/v1/assets/:id` - Update asset
- `DELETE /api/v1/assets/:id` - Request asset decommission
- `GET /api/v1/assets/stats` - Get asset statistics
- `POST /api/v1/assets/bulk` - Bulk create assets
- `GET /api/v1/assets/types` - Get asset types with counts
- `GET /api/v1/assets/locations` - Get asset locations with counts

### Workflows
- `GET /api/v1/workflows` - List workflows
- `POST /api/v1/workflows` - Create workflow
- `GET /api/v1/workflows/:id` - Get workflow by ID
- `PUT /api/v1/workflows/:id/approve` - Approve workflow
- `PUT /api/v1/workflows/:id/reject` - Reject workflow
- `GET /api/v1/workflows/stats` - Get workflow statistics
- `GET /api/v1/workflows/history/:assetId` - Get asset workflow history

### Reports
- `GET /api/v1/reports/inventory` - Generate inventory report (CSV)
- `GET /api/v1/reports/lifecycle` - Generate lifecycle report (CSV)
- `GET /api/v1/reports/compliance` - Generate compliance report (CSV)

### Feishu Integration
- `POST /api/v1/feishu/webhook` - Handle Feishu webhook

## Features

### Asset Management
- ✅ Create, read, update, and delete assets
- ✅ Asset status management (online, offline, maintenance, decommissioned)
- ✅ Asset type categorization (server, network, storage, workstation)
- ✅ Location tracking
- ✅ Bulk asset import (JSON/CSV)
- ✅ Asset export (CSV)
- ✅ Advanced filtering and search

### Workflow Management
- ✅ Feishu approval workflow integration
- ✅ Asset onboarding workflows
- ✅ Asset decommission workflows
- ✅ Status change workflows
- ✅ Maintenance request workflows
- ✅ Workflow history tracking
- ✅ Priority management

### Dashboard & Analytics
- ✅ Real-time asset statistics
- ✅ Interactive charts (using Chart.js)
- ✅ Recent workflow activity
- ✅ Asset status distribution
- ✅ Workflow status tracking

### Reporting
- ✅ Inventory reports
- ✅ Lifecycle management reports
- ✅ Compliance audit reports
- ✅ CSV export functionality

### Technical Features
- ✅ Clean Architecture (Domain-Driven Design)
- ✅ MongoDB integration with proper indexing
- ✅ Consul service discovery
- ✅ Docker containerization
- ✅ CORS support
- ✅ Health check endpoints
- ✅ Graceful shutdown

## Environment Variables

### Backend
- `MONGODB_URI` - MongoDB connection string (default: mongodb://localhost:27017)
- `CONSUL_ADDRESS` - Consul address (default: localhost:8500)
- `PORT` - Server port (default: 8080)
- `SERVICE_ADDRESS` - Service address for Consul registration (default: localhost)

### Frontend
- `BACKEND_HOST` - Backend host (default: localhost)
- `BACKEND_PORT` - Backend port (default: 8080)

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check the MONGODB_URI environment variable
   - Verify network connectivity

2. **Port Already in Use**
   - Change the PORT environment variable
   - Kill existing processes using the port

3. **Go Dependencies Issues**
   - Run `go mod tidy` in the backend directory
   - Ensure Go version 1.21 or later

4. **Node.js Dependencies Issues**
   - Run `npm install` in the project root
   - Clear npm cache: `npm cache clean --force`

5. **Docker Issues**
   - Ensure Docker is running
   - Check Docker Compose version
   - Remove existing containers: `docker-compose down`

### Logs and Debugging

- Backend logs are printed to console
- Frontend server logs are available in the terminal
- MongoDB logs can be viewed with: `docker logs cmdb-mongodb`
- Consul logs can be viewed with: `docker logs cmdb-consul`

## Development

### Adding New Features

1. **Backend Changes**
   - Add models in `backend/domain/model/`
   - Add repositories in `backend/domain/repository/`
   - Add services in `backend/domain/service/`
   - Add applications in `backend/application/`
   - Add handlers in `backend/interfaces/api/`

2. **Frontend Changes**
   - Update HTML in `frontend/index.html`
   - Add styles in `frontend/style.css`
   - Add JavaScript in `frontend/script.js` or `frontend/dashboard.js`

### Testing

- Backend: `cd backend && go test ./...`
- Frontend: Open browser developer tools for debugging

## Production Deployment

1. **Build Docker Images**
   ```bash
   docker-compose build
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Environment Configuration**
   - Set production MongoDB URI
   - Configure Consul cluster
   - Set appropriate service addresses
   - Enable authentication and SSL

## License

MIT License - see LICENSE file for details.