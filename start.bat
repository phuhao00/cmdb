@echo off
echo Starting CMDB System...
echo.

echo [1/3] Starting MongoDB with Docker...
docker run -d --name cmdb-mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo:7.0

echo.
echo [2/3] Waiting for MongoDB to start...
timeout /t 10 /nobreak > nul

echo.
echo [3/3] Starting CMDB Backend API...
cd backend
set MONGODB_URI=mongodb://admin:password123@localhost:27017/cmdb?authSource=admin
set PORT=8080
go run main.go

pause