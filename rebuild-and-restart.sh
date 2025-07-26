#!/bin/bash

echo "CMDB - Rebuild and Restart Script"
echo "================================"

# Stop existing services
echo "Stopping existing services..."
docker-compose down

# Remove old images
echo "Removing old images..."
docker rmi cmdb-backend cmdb-frontend cmdb-cmdb-api 2>/dev/null

# Remove all images with cmdb prefix
echo "Removing all cmdb related images..."
docker images --format "{{.Repository}}:{{.Tag}}" | grep cmdb | xargs -r docker rmi

# Remove dangling images
echo "Removing dangling images..."
docker image prune -f

# Build backend image
echo "Building backend image..."
cd backend
docker build -t cmdb-backend .
if [ $? -ne 0 ]; then
    echo "Error building backend image"
    exit 1
fi
cd ..

# Build frontend image
echo "Building frontend image..."
docker build -t cmdb-frontend -f Dockerfile.frontend .
if [ $? -ne 0 ]; then
    echo "Error building frontend image"
    exit 1
fi

# Start services
echo "Starting services..."
docker-compose up -d

# Show status
echo "Services status:"
docker-compose ps

echo ""
echo "Rebuild and restart completed!"