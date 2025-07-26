# CMDB - Configuration Management Database

A modern Configuration Management Database system for tracking IT assets and integrating approval workflows, specifically designed for IDC (Internet Data Center) and data center operations.

## Features

### Asset Management
- Track all IT assets (servers, network equipment, storage, workstations)
- Monitor asset status (online, offline, maintenance, decommissioned)
- Record asset details including location, description, and cost information
- Bulk asset creation for easy onboarding

### Cost Tracking
- Track purchase price and annual costs for each asset
- Visualize cost distribution across asset types
- Monitor total investment and ongoing operational costs
- Currency support for financial tracking

### Workflow Management
- Integrated approval workflows for asset changes
- Status change requests with automated workflow creation
- Maintenance scheduling with approval processes
- Decommissioning workflows for end-of-life assets

### Dashboard & Visualization
- Real-time asset status overview
- Interactive charts for asset distribution and workflow status
- Cost visualization with breakdown by asset type
- Critical assets monitoring for key infrastructure components
- Recent activity tracking

### Reporting
- Inventory reports with export to CSV
- Lifecycle reports for asset age tracking
- Compliance reports for audit purposes

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript with Chart.js for data visualization
- **Backend**: Go with Gin framework
- **Database**: MongoDB for flexible data storage
- **Containerization**: Docker & Docker Compose for easy deployment
- **Proxy**: Express with http-proxy-middleware for development

## Quick Start

1. **Prerequisites**:
   - Docker and Docker Compose
   - Node.js >= 14.0.0
   - Go (latest stable version)

2. **Installation**:
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd cmdb

   # Install frontend dependencies
   npm install
   ```

3. **Running the Application**:
   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d

   # Or using start scripts
   ./start.sh        # Linux/Mac
   start.bat         # Windows
   ```

4. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

## API Endpoints

### Assets
- `GET /api/assets` - List all assets
- `POST /api/assets` - Create a new asset
- `GET /api/assets/:id` - Get asset by ID
- `PUT /api/assets/:id` - Update asset details
- `DELETE /api/assets/:id` - Request asset decommission
- `GET /api/assets/stats` - Get asset statistics
- `GET /api/assets/types` - Get asset types distribution
- `GET /api/assets/locations` - Get asset locations distribution
- `GET /api/assets/costs` - Get asset cost summary
- `GET /api/assets/critical` - Get critical assets
- `PUT /api/assets/:id/costs` - Update asset costs

### Workflows
- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Create a new workflow
- `GET /api/workflows/:id` - Get workflow by ID
- `PUT /api/workflows/:id` - Update workflow
- `GET /api/workflows/stats` - Get workflow statistics

### Reports
- `GET /api/reports/inventory` - Generate inventory report
- `GET /api/reports/lifecycle` - Generate lifecycle report
- `GET /api/reports/compliance` - Generate compliance report

## For IDC/Data Center Managers

This CMDB is specifically designed to help IDC and data center managers:

1. **Quick Status Overview**: The dashboard provides an instant view of your entire infrastructure health
2. **Cost Transparency**: Track both capital expenditure (purchase price) and operational expenditure (annual costs)
3. **Critical Asset Monitoring**: Focus on your most important systems (typically online servers)
4. **Operational Insights**: Understand workflow patterns and approval bottlenecks
5. **Compliance Ready**: Generate reports for audits and compliance verification

## Development

### Backend Development
```bash
cd backend
go run main.go
```

### Frontend Development
```bash
npm start
```

### Running Both Services
```bash
npm run start:all
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on the GitHub repository or contact the development team.