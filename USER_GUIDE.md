# CMDB User Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [Asset Management](#asset-management)
4. [Workflow Management](#workflow-management)
5. [Dashboard & Reports](#dashboard--reports)
6. [Troubleshooting](#troubleshooting)

## System Overview

The Configuration Management Database (CMDB) is a comprehensive system for managing IT assets and their lifecycle. It provides features for tracking assets, managing workflows, and generating reports.

### Key Features
- **Asset Management**: Track all IT assets including servers, network equipment, storage, and workstations
- **Workflow Management**: Create and manage approval workflows for asset changes
- **Dashboard**: Real-time visualization of asset status and workflow metrics
- **Reporting**: Generate detailed reports on inventory, lifecycle, and compliance
- **Feishu Integration**: Simulated integration with Feishu approval workflows

## Getting Started

### System Requirements
- Docker and Docker Compose
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Starting the System
1. Open a terminal/command prompt
2. Navigate to the project directory
3. Run the following command:
   ```bash
   docker-compose up -d
   ```
4. Wait for all services to start (usually 1-2 minutes)

### Accessing the Application
- **Web Interface**: http://localhost:3000
- **API Documentation**: http://localhost:8081/swagger/index.html (if available)

## Asset Management

### Viewing Assets
1. Navigate to the "Assets" section using the top navigation menu
2. All assets will be displayed in a table format
3. Use the search box to filter assets by name, type, or location
4. Click on column headers to sort the asset list

### Adding New Assets
1. Click the "Add Asset" button in the Assets section
2. Fill in the asset details:
   - Name: Descriptive name for the asset
   - Type: Select from Server, Network, Storage, or Workstation
   - Location: Physical location of the asset
   - Description: Additional details about the asset
3. Click "Submit" to add the asset

### Editing Assets
1. Find the asset you want to edit in the asset table
2. Click the edit icon (pencil) in the Actions column
3. Modify the asset details as needed
4. Click "Submit" to save changes

### Changing Asset Status
1. Find the asset in the asset table
2. Click the power icon to initiate a status change workflow
3. The workflow will be sent for approval

### Decommissioning Assets
1. Find the asset in the asset table
2. Click the trash icon to initiate decommission workflow
3. Confirm the decommission request
4. The workflow will be sent for approval

### Bulk Import
1. Click the "Bulk Import" button in the Assets section
2. Choose either JSON or CSV format
3. Enter or paste your asset data
4. Click "Import Assets" to process the data

### Exporting Assets
1. Click the "Export Assets" button
2. A CSV file with all assets will be downloaded

## Workflow Management

### Creating Workflows
1. Navigate to the "Workflows" section
2. Click the "Create Workflow" button
3. Fill in the workflow details:
   - Type: Select the type of workflow
   - Asset: Choose the affected asset
   - Priority: Set workflow priority
   - Reason: Explain the reason for the workflow
4. Click "Submit" to create the workflow

### Approving/Rejecting Workflows
1. Navigate to the "Workflows" section
2. Find the workflow you want to process
3. Click "Approve" to approve the workflow or "Reject" to reject it
4. Approved workflows will be processed immediately

### Workflow Types
- **Asset Onboarding**: Add new assets to the system
- **Asset Decommission**: Remove assets from the system
- **Status Change**: Change asset status (online/offline)
- **Maintenance Request**: Schedule maintenance for assets

## Dashboard & Reports

### Dashboard
The dashboard provides real-time insights into your IT assets:
- Asset statistics by status
- Workflow metrics
- Cost summaries
- Critical asset information
- Recent activity

Click the "Refresh" button to update dashboard data.

### Reports
Three types of reports are available:
1. **Inventory Report**: Complete list of all assets
2. **Lifecycle Report**: Asset age and lifecycle information
3. **Compliance Report**: Compliance and audit information

To generate a report:
1. Navigate to the "Reports" section
2. Click the "Download" button for the desired report
3. A CSV file will be downloaded

## Troubleshooting

### Common Issues

#### Services Not Starting
If services fail to start:
1. Ensure Docker is running
2. Check if ports 3000, 8081, 27017, and 8500 are not in use
3. Run `docker-compose down` and try again

#### Cannot Access Web Interface
If you can't access the web interface:
1. Check if all services are running with `docker-compose ps`
2. Verify the frontend service is healthy
3. Check browser console for errors

#### API Errors
If you encounter API errors:
1. Verify the backend service is running
2. Check backend logs with `docker logs cmdb-api`
3. Ensure MongoDB is accessible

#### Database Connection Issues
If there are database connection issues:
1. Verify MongoDB is running
2. Check database credentials in docker-compose.yml
3. Review MongoDB logs with `docker logs cmdb-mongodb`

### Useful Commands

#### Check Service Status
```bash
docker-compose ps
```

#### View Logs
```bash
# Backend API logs
docker logs cmdb-api

# Frontend logs
docker logs cmdb-frontend

# Database logs
docker logs cmdb-mongodb

# Consul logs
docker logs cmdb-consul
```

#### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart cmdb-api
```

#### Stop Services
```bash
docker-compose down
```

### Getting Help
If you encounter issues not covered in this guide:
1. Check the project documentation in README.md
2. Review the backend and frontend README files
3. Check the GitHub issues for similar problems
4. Contact the development team

## 🔄 System Maintenance

### Updating the System
To update to a new version:
1. Pull the latest code from the repository
2. Run `docker-compose down`
3. Run `docker-compose up -d`

### Backup and Restore
To backup the database:
```bash
docker exec cmdb-mongodb mongodump --username admin --password password123 --authenticationDatabase admin --db cmdb --out /tmp/backup
docker cp cmdb-mongodb:/tmp/backup ./backup
```

To restore the database:
```bash
docker cp ./backup cmdb-mongodb:/tmp/backup
docker exec cmdb-mongodb mongorestore --username admin --password password123 --authenticationDatabase admin /tmp/backup
```

## 📞 Support

For additional support, please contact:
- System Administrator: admin@company.com
- Development Team: dev-team@company.com

---

*This user guide was last updated: 2025-07-26*