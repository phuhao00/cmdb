# CMDB Frontend

Modern web interface for the Configuration Management Database (CMDB) system.

## Features

- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Real-time Dashboard** - Live statistics and asset monitoring
- **Asset Management** - Create, edit, delete, and manage IT assets
- **Workflow Interface** - Feishu integration for approval workflows
- **Advanced Filtering** - Search and filter assets by multiple criteria
- **Report Generation** - Export inventory, lifecycle, and compliance reports
- **Interactive UI** - Modern design with smooth animations

## Technology Stack

- **HTML5** - Semantic markup and modern web standards
- **CSS3** - Flexbox, Grid, animations, and responsive design
- **JavaScript (ES6+)** - Async/await, fetch API, modern syntax
- **Font Awesome** - Icon library for UI elements

## File Structure

```
frontend/
├── index.html    # Main HTML page
├── style.css     # Stylesheet with responsive design
├── script.js     # JavaScript functionality and API integration
└── README.md     # This file
```

## Features Overview

### Dashboard
- Asset count statistics
- Status distribution charts
- Pending approval notifications
- Quick action buttons

### Asset Management
- Asset table with sorting and filtering
- Add/Edit asset modal forms
- Status change workflows
- Bulk operations support

### Workflow Management
- Feishu approval integration
- Workflow status tracking
- Priority management
- Approval/rejection actions

### Reports
- Inventory reports (CSV export)
- Lifecycle analysis
- Compliance reporting
- Custom date ranges

## API Integration

The frontend communicates with the backend API using:
- RESTful endpoints
- JSON data format
- Async/await for API calls
- Error handling and notifications

## Development

To run the frontend locally:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve . -p 8080

# Using PHP
php -S localhost:8080
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px