#!/bin/bash

echo "====================================="
echo "CMDB System Health Check"
echo "====================================="
echo

echo "Checking Docker status..."
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed or not in PATH"
    echo "Please install Docker from https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo "[OK] Docker is installed"

echo
echo "Checking Docker service..."
if ! docker ps &> /dev/null; then
    echo "[ERROR] Docker service is not running"
    echo "Please start Docker service"
    exit 1
fi
echo "[OK] Docker service is running"

echo
echo "Checking CMDB containers..."
echo

# Check MongoDB
if docker ps --format "{{.Names}}" | grep -q mongodb; then
    echo "[OK] MongoDB is running"
else
    echo "[WARNING] MongoDB container is not running"
fi

# Check Backend
if docker ps --format "{{.Names}}" | grep -q backend; then
    echo "[OK] Backend is running"
else
    echo "[WARNING] Backend container is not running"
fi

# Check Frontend
if docker ps --format "{{.Names}}" | grep -q frontend; then
    echo "[OK] Frontend is running"
else
    echo "[WARNING] Frontend container is not running"
fi

echo
echo "Checking port availability..."

# Function to check port
check_port() {
    local port=$1
    local service=$2
    if lsof -i :$port &> /dev/null || netstat -an 2>/dev/null | grep -q ":$port.*LISTEN"; then
        echo "[OK] Port $port is listening ($service)"
    else
        echo "[WARNING] Port $port is not listening"
    fi
}

# Check ports
check_port 3000 "Frontend"
check_port 8081 "Backend API"
check_port 27017 "MongoDB"

echo
echo "Testing API connectivity..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/api/v1/assets/stats 2>/dev/null)

if [ "$STATUS" = "401" ]; then
    echo "[OK] Backend API is responding (requires authentication)"
elif [ "$STATUS" = "200" ]; then
    echo "[OK] Backend API is responding"
else
    echo "[WARNING] Backend API is not responding (Status: $STATUS)"
fi

echo
echo "====================================="
echo "Health check completed!"
echo "====================================="
echo
echo "If you see any WARNINGS or ERRORS above, please:"
echo "1. Run: docker-compose logs [service-name]"
echo "2. Check README.md for troubleshooting"
echo "3. Restart services: ./scripts/rebuild-and-restart.sh"
echo