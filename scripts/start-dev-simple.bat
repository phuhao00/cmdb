@echo off
echo "Starting CMDB development environment..."

echo "1. Starting backend..."
cd backend
start cmd /k "go run main.go"

echo "2. Starting frontend..."
cd ..\frontend
start cmd /k "npm run dev"

echo "Development servers started!"
echo "Backend: http://localhost:8081"
echo "Frontend: http://localhost:3000"
pause