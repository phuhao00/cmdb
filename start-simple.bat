@echo off
echo Starting CMDB System (Simple Mode)...
echo.

echo [1/2] Starting Backend API...
cd backend
set MONGODB_URI=mongodb://localhost:27017/cmdb
set PORT=8081
start cmd /k "go run main.go"

echo.
echo [2/2] Starting Frontend Server...
cd ..
set BACKEND_HOST=localhost
set BACKEND_PORT=8081
start cmd /k "npm start"

echo.
echo CMDB System started:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8081/api/v1
echo.
echo Note: This requires MongoDB to be running on localhost:27017
echo.
pause
