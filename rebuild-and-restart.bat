@echo off
echo CMDB - Rebuild and Restart Script
echo ================================

REM Stop existing services
echo Stopping existing services...
docker-compose down

REM Remove old images
echo Removing old images...
docker rmi cmdb-backend cmdb-frontend cmdb-cmdb-api 2>nul

REM Remove all images with cmdb prefix
echo Removing all cmdb related images...
for /f "tokens=*" %%i in ('docker images --format "table {{.Repository}}:{{.Tag}}" ^| findstr cmdb') do (
    docker rmi %%i 2>nul
)

REM Remove dangling images
echo Removing dangling images...
docker image prune -f

REM Build backend image
echo Building backend image...
cd backend
docker build -t cmdb-backend .
if %errorlevel% neq 0 (
    echo Error building backend image
    exit /b %errorlevel%
)
cd ..

REM Build frontend image
echo Building frontend image...
docker build -t cmdb-frontend -f Dockerfile.frontend .
if %errorlevel% neq 0 (
    echo Error building frontend image
    exit /b %errorlevel%
)

REM Start services
echo Starting services...
docker-compose up -d

REM Show status
echo Services status:
docker-compose ps

echo.
echo Rebuild and restart completed!