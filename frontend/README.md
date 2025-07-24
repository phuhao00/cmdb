# CMDB Frontend

This is the frontend web interface for the Configuration Management Database (CMDB) system.

## Features

- Modern responsive web interface
- Real-time dashboard with asset statistics
- Asset management with filtering and search
- Workflow approval interface
- Report generation UI

## Structure

- `index.html` - Main HTML structure
- `style.css` - CSS styles for responsive design
- `script.js` - JavaScript for API integration and UI interactions

## Development

The frontend is built with vanilla HTML, CSS, and JavaScript without any frameworks. It communicates with the backend API using fetch requests.

### API Integration

The frontend connects to the backend API at `/api/v1/` endpoints. The main API functions are:

- Asset management (CRUD operations)
- Workflow approvals
- Report generation
- Dashboard statistics

### UI Components

- Dashboard with statistics cards
- Asset management table with filters
- Workflow approval cards
- Report generation interface
- Modal forms for asset and workflow creation

## Usage

1. Start the backend server
2. Access the web interface at http://localhost:8080
3. Use the navigation menu to access different sections
4. Add, edit, and manage assets through the interface
5. Process workflow approvals
6. Generate reports

## Customization

To customize the UI:

- Edit `style.css` to change colors, fonts, and layout
- Modify `index.html` to adjust the structure
- Update `script.js` to change behavior and API interactions