@echo off
echo =====================================
echo CMDB System Health Check
echo =====================================
echo.

echo Checking Docker status...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    exit /b 1
)
echo [OK] Docker is installed

echo.
echo Checking Docker service...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker service is not running
    echo Please start Docker Desktop
    exit /b 1
)
echo [OK] Docker service is running

echo.
echo Checking CMDB containers...
echo.

REM Check MongoDB
docker ps --format "table {{.Names}}\t{{.Status}}" | findstr mongodb >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB container is not running
) else (
    echo [OK] MongoDB is running
)

REM Check Backend
docker ps --format "table {{.Names}}\t{{.Status}}" | findstr backend >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Backend container is not running
) else (
    echo [OK] Backend is running
)

REM Check Frontend
docker ps --format "table {{.Names}}\t{{.Status}}" | findstr frontend >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Frontend container is not running
) else (
    echo [OK] Frontend is running
)

echo.
echo Checking port availability...

REM Check port 3000 (Frontend)
netstat -an | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Port 3000 is listening (Frontend)
) else (
    echo [WARNING] Port 3000 is not listening
)

REM Check port 8081 (Backend API)
netstat -an | findstr :8081 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Port 8081 is listening (Backend API)
) else (
    echo [WARNING] Port 8081 is not listening
)

REM Check port 27017 (MongoDB)
netstat -an | findstr :27017 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Port 27017 is listening (MongoDB)
) else (
    echo [WARNING] Port 27017 is not listening
)

echo.
echo Testing API connectivity...
curl -s -o nul -w "%%{http_code}" http://localhost:8081/api/v1/assets/stats >temp_status.txt 2>nul
set /p STATUS=<temp_status.txt
del temp_status.txt >nul 2>&1

if "%STATUS%"=="401" (
    echo [OK] Backend API is responding (requires authentication)
) else if "%STATUS%"=="200" (
    echo [OK] Backend API is responding
) else (
    echo [WARNING] Backend API is not responding (Status: %STATUS%)
)

echo.
echo =====================================
echo Health check completed!
echo =====================================
echo.
echo If you see any WARNINGS or ERRORS above, please:
echo 1. Run: docker-compose logs [service-name]
echo 2. Check README.md for troubleshooting
echo 3. Restart services: .\scripts\rebuild-and-restart.bat
echo.
pause