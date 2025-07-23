# CMDB - Configuration Management Database

A comprehensive Configuration Management Database (CMDB) system built with Golang backend, MongoDB database, and modern web frontend. Features integrated Feishu approval workflows for asset lifecycle management.

## Features

### Asset Management
- 📥 **Asset Onboarding** - Add new assets with approval workflow
- 📤 **Asset Decommissioning** - Remove assets from inventory
- 🔄 **Status Management** - Online/Offline/Maintenance status changes
- 🏪 **Inventory Management** - Complete asset tracking and cataloging
- 🔧 **Maintenance Requests** - Schedule and track maintenance

### Feishu Integration
- 📋 **Approval Workflows** - All asset operations require approval
- 🔔 **Workflow Notifications** - Real-time status updates
- 👥 **Multi-level Approvals** - Support for complex approval chains
- 📊 **Workflow Tracking** - Monitor approval status and history

### Dashboard & Analytics
- 📈 **Real-time Statistics** - Asset counts, status distribution
- 🔍 **Advanced Filtering** - Filter by status, type, location
- 📋 **Asset Table** - Comprehensive asset listing with actions
- 📊 **Compliance Reporting** - Generate audit and compliance reports

## Technology Stack

- **Backend**: Golang with Gin framework
- **Database**: MongoDB
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Integration**: Feishu API for approval workflows
- **Deployment**: Docker & Docker Compose

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Go 1.21+ (for local development)
- MongoDB (if running locally)

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd cmdb
```

2. Start the application:
```bash
docker-compose up -d
```

3. Access the application:
- Web Interface: http://localhost:8080
- MongoDB: localhost:27017

### Local Development

1. Install dependencies:
```bash
go mod download
```

2. Start MongoDB:
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or install MongoDB locally
```

3. Set environment variables:
```bash
export MONGODB_URI="mongodb://localhost:27017"
export PORT="8080"
```

4. Run the application:
```bash
go run main.go
```

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

## Configuration

### Environment Variables
- `MONGODB_URI` - MongoDB connection string (default: mongodb://localhost:27017)
- `PORT` - Server port (default: 8080)

### MongoDB Collections
- `assets` - Asset information
- `workflows` - Approval workflows

## Asset Lifecycle

1. **Asset Creation** → Triggers onboarding workflow
2. **Feishu Approval** → Automated approval process
3. **Asset Activation** → Status changes to online
4. **Maintenance** → Status changes with approval
5. **Decommission** → Removal workflow with approval

## Workflow Types

- **Asset Onboarding** - New asset registration
- **Asset Decommission** - Asset removal
- **Status Change** - Online/Offline transitions
- **Maintenance Request** - Scheduled maintenance

## Development

### Project Structure
```
cmdb/
├── backend/             # Golang backend API
│   ├── main.go         # Main application entry point
│   ├── go.mod          # Go module dependencies
│   ├── Dockerfile      # Backend Docker configuration
│   ├── init-mongo.js   # MongoDB initialization
│   └── README.md       # Backend documentation
├── frontend/           # Web frontend
│   ├── index.html      # Main HTML page
│   ├── style.css       # Stylesheet
│   ├── script.js       # JavaScript functionality
│   └── README.md       # Frontend documentation
├── docker-compose.yml  # Multi-container setup
└── README.md           # This file
```

### Adding New Features

1. **Backend**: Add new routes in `main.go`
2. **Frontend**: Update JavaScript functions in `script.js`
3. **Database**: Modify MongoDB collections as needed
4. **Feishu**: Extend webhook handling for new workflow types

## Deployment

### Production Deployment

1. Build and deploy using Docker:
```bash
docker-compose -f docker-compose.yml up -d
```

2. Configure environment variables for production
3. Set up MongoDB with proper authentication
4. Configure Feishu webhook URLs

### Scaling

- Use MongoDB replica sets for high availability
- Deploy multiple API instances behind a load balancer
- Implement Redis for session management if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the GPL v3 License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**CMDB System** - Streamlining IT infrastructure management with comprehensive asset lifecycle automation.