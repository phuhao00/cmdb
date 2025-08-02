#!/bin/bash

echo "Starting CMDB System (Simple Mode)..."
echo

echo "[1/2] Starting Backend API..."
cd backend
export MONGODB_URI="mongodb://localhost:27017/cmdb"
export PORT=8081
go run main.go &
BACKEND_PID=$!

echo
echo "[2/2] Starting Frontend Server..."
cd ..
export BACKEND_HOST="localhost"
export BACKEND_PORT=8081
npm start &
FRONTEND_PID=$!

echo
echo "CMDB System started:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8081/api/v1"
echo
echo "Note: This requires MongoDB to be running on localhost:27017"
echo
echo "Press Ctrl+C to stop all services"

# Wait for user to press Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Stopping all services...'" INT
wait