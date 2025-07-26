# CMDB React Frontend

This is a modern React-based frontend implementation for the CMDB (Configuration Management Database) system.

## Overview

The CMDB React Frontend provides a user-friendly interface for managing configuration items (CIs), tracking relationships between IT assets, and monitoring changes across the organization's IT infrastructure.

## Key Features

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-Time Dashboard**: Visualizes key CMDB metrics with interactive charts
- **Asset Management**: Comprehensive interface for managing configuration items
- **Workflow Management**: Track and approve changes through defined processes
- **Reporting**: Generate detailed reports on CMDB data
- **Multi-Language Support**: Available in English and Chinese
- **RESTful API Integration**: Communicates with backend services via standardized API endpoints

## Technology Stack

- **React 18** with hooks and context API for component-based architecture
- **React Router** for declarative routing and navigation
- **Styled Components** for maintainable and scoped CSS
- **Chart.js** with React wrapper for data visualization
- **Axios** for robust API request handling
- **React Icons** for scalable icon implementation
- **PropTypes** for component API documentation

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
   ```bash
   cd frontend-react
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server with:
```bash
npm start
```

The application will be available at http://localhost:3000

### Building for Production

To create a production-ready build:
```bash
npm run build
```

This will generate optimized files in the `build` directory that can be deployed to any web server.

## Project Structure

The source code is organized as follows:

```
src/
├── components/     # Reusable UI components with individual directories
├── pages/          # Top-level route components (Dashboard, Assets, Workflows, Reports)
├── services/       # API service functions for backend communication
├── utils/          # Utility functions and helpers
├── App.js          # Main App component with routing
├── index.js        # Entry point and root React component
└── index.css       # Global styles and resets
```

## API Integration

The frontend communicates with the backend API using Axios. All API endpoints are defined in `src/services/api.js`.

By default, the application expects the backend to be available at `/api/v1/*` endpoints. Ensure the backend service is running and accessible when using the frontend.

## Configuration

Environment-specific configuration can be managed through `.env` files:

- `.env` - Default environment variables
- `.env.development` - Development-specific variables
- `.env.production` - Production-specific variables

Common configuration includes:
- API endpoint URLs
- Feature flags
- Third-party service keys

## Deployment

### Docker Deployment

The application can be containerized using the provided Dockerfile:

```bash
docker build -t cmdb-frontend-react .
docker run -p 3000:3000 cmdb-frontend-react
```

See the main project's `docker-compose.yml` file for the complete multi-container setup.

### Traditional Web Server Deployment

For traditional deployment:

1. Build the application: `npm run build`
2. Serve the `build/` directory using a web server such as Nginx or Apache

## Customization

### Styling

The application uses Styled Components for CSS-in-JS styling. To customize the look and feel:

1. Modify the styled components directly
2. Update global styles in `index.css`
3. Add new theme variables if needed

### Language Support

The application supports both English and Chinese. Language translations are defined in each component. To add more languages or modify translations:

1. Update the `translations` objects in each component
2. Add language selection functionality if not already implemented
3. Test the application with each supported language

### Feature Development

When adding new features:

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Implement your changes following existing code patterns
3. Test your changes thoroughly
4. Commit your changes: `git commit -m 'Add new feature'`
5. Push to your branch: `git push origin feature/your-feature-name`
6. Open a pull request for review

## Contributing

We welcome contributions to improve the CMDB React Frontend. To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Implement your changes following the project's coding standards
4. Commit your changes with descriptive messages (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a pull request explaining your changes

Please ensure your code is well-documented and follows the patterns established in the existing codebase.

## License

This project is licensed under the MIT License - see the LICENSE file for details.