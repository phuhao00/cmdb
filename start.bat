@echo off
echo Starting CMDB System...
echo.

echo [1/5] Starting MongoDB with Docker...
docker rm -f cmdb-mongodb 2>nul
docker run -d --name cmdb-mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password123 -v %cd%\backend\init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro mongo:7.0

echo.
echo [2/5] Starting Consul with Docker...
docker rm -f cmdb-consul 2>nul
docker run -d --name cmdb-consul -p 8500:8500 -p 8600:8600/udp consul:1.15 agent -server -ui -node=server-1 -bootstrap-expect=1 -client=0.0.0.0

echo.
echo [3/5] Waiting for services to start...
timeout /t 10 /nobreak > nul

echo.
echo [4/5] Starting CMDB Backend API...
start cmd /k "cd backend && set MONGODB_URI=mongodb://admin:password123@localhost:27017/cmdb?authSource=admin && set CONSUL_ADDRESS=localhost:8500 && set PORT=8080 && set SERVICE_ADDRESS=localhost && go run main.go"

echo.
echo [5/5] Starting Frontend Server...
start cmd /k "set BACKEND_HOST=localhost && set BACKEND_PORT=8080 && npm start"

echo.
echo CMDB System started:
echo - Frontend: http://localhost:8080
echo - Backend API: http://localhost:8080/api/v1
echo - MongoDB: localhost:27017
echo - Consul UI: http://localhost:8500
echo.
pause
