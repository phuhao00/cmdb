# CMDB Frontend (React)

This is the modern React-based frontend for the Configuration Management Database (CMDB) system.

## Features

- Single Page Application (SPA) architecture
- Modern UI with responsive design
- Real-time dashboard with asset statistics
- Asset management with filtering and search
- Workflow approval interface
- Report generation UI
- Multi-language support (English/Chinese)

## Technology Stack

- **React** - JavaScript library for building user interfaces
- **React Router** - Declarative routing for React
- **Styled Components** - Visual primitives for the age of React
- **Chart.js** - Simple yet flexible JavaScript charting
- **Axios** - Promise based HTTP client
- **React Icons** - Popular icons as React components

## Project Structure

```
frontend-react/
├── public/                 # Static assets
│   └── index.html         # Main HTML template
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   ├── App.js             # Main application component
│   ├── index.js           # Entry point
│   └── index.css          # Global styles
├── package.json           # Project dependencies and scripts
└── README.md              # This documentation
```

## Development

### Prerequisites

- Node.js >= 14.0.0
- npm or yarn

### Installation

```bash
cd frontend-react
npm install
```

### Running the Application

#### Development Mode

```bash
npm start
```

This will start the development server on http://localhost:3000

#### Production Build

```bash
npm run build
```

This will create a production-ready build in the `build/` directory.

## Folder Structure Details

### Components

Reusable UI components that can be used across different pages.

### Pages

Each page component represents a route in the application:
- Dashboard - Main overview page with statistics and charts
- Assets - Asset management interface
- Workflows - Workflow approval interface
- Reports - Report generation and download

### Services

API service layer that handles all communication with the backend:
- Asset management endpoints
- Workflow management endpoints
- Report generation endpoints

## Customization

### Styling

The application uses Styled Components for styling. You can customize the look and feel by modifying the styled components in each file.

### Languages

The application supports both English and Chinese. Language translations are defined in each component. To add more languages or modify translations, update the `translations` objects in each component.

### API Integration

API endpoints are defined in `src/services/api.js`. To modify the backend API integration:

1. Update the base URL in `src/services/api.js`
2. Modify the individual API functions as needed
3. Update components to use the new API functions

## Deployment

### Docker

The application can be containerized using the provided Dockerfile:

```bash
docker build -t cmdb-frontend-react .
docker run -p 3000:3000 cmdb-frontend-react
```

### Traditional Deployment

1. Build the application: `npm run build`
2. Serve the `build/` directory using any web server (nginx, Apache, etc.)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request