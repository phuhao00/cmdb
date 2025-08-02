#!/bin/bash

echo "🚀 Starting CMDB System - Production Mode"
echo "========================================"
echo "Using Docker Compose + nginx + optimized builds"
echo

echo "[1/4] Cleaning up any existing services..."
docker-compose down
docker system prune -f --volumes 2>/dev/null

echo
echo "[2/4] Building production images..."
echo "Building frontend with nginx..."
docker-compose build frontend

echo "Building backend..."
docker-compose build cmdb-api

echo
echo "[3/4] Starting all services in production mode..."
docker-compose up -d

echo
echo "[4/4] Verifying service health..."
sleep 10

echo "Service Status:"
docker-compose ps
echo

# Check if all services are healthy
FRONTEND_STATUS=$(docker-compose ps -q frontend | xargs docker inspect --format='{{.State.Status}}')
BACKEND_STATUS=$(docker-compose ps -q cmdb-api | xargs docker inspect --format='{{.State.Status}}')
MONGO_STATUS=$(docker-compose ps -q mongodb | xargs docker inspect --format='{{.State.Status}}')

echo "Health Check:"
echo "- Frontend (nginx): $FRONTEND_STATUS"
echo "- Backend API: $BACKEND_STATUS"
echo "- MongoDB: $MONGO_STATUS"
echo

if [[ "$FRONTEND_STATUS" == "running" && "$BACKEND_STATUS" == "running" && "$MONGO_STATUS" == "running" ]]; then
    echo "✅ All services are healthy!"
    echo
    echo "🎉 CMDB Production System is ready:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌐 Frontend (nginx):     http://localhost:3000"
    echo "🔧 Backend API:          http://localhost:8081/api/v1"
    echo "📊 MongoDB:              localhost:27017"
    echo "⚙️  Consul UI:           http://localhost:8500"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    echo "Production Features:"
    echo "✓ nginx reverse proxy with gzip compression"
    echo "✓ Static asset caching and optimization"
    echo "✓ Security headers enabled"
    echo "✓ React Router SPA support"
    echo "✓ API proxying (/api/ → backend)"
    echo
    echo "Management Commands:"
    echo "- Stop:     docker-compose down"
    echo "- Logs:     docker-compose logs -f"
    echo "- Restart:  docker-compose restart"
    echo "- Scale:    docker-compose up -d --scale cmdb-api=2"
    echo
else
    echo "❌ Some services failed to start properly!"
    echo "Check logs with: docker-compose logs"
fi

# Option to follow logs
read -p "Follow application logs? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Following logs (Ctrl+C to stop watching)..."
    docker-compose logs -f
fi 