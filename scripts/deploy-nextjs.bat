@echo off
REM CMDB系统Next.js版本部署脚本
REM 自动构建和启动CMDB系统

echo ========================================
echo CMDB系统 - Next.js版本部署脚本
echo ========================================
echo.

REM 检查Docker是否运行
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Docker未运行，请先启动Docker Desktop
    pause
    exit /b 1
)

echo [1/5] 停止并清理旧容器...
docker-compose down >nul 2>&1

echo [2/5] 构建后端镜像...
docker-compose build cmdb-api
if %errorlevel% neq 0 (
    echo [错误] 后端镜像构建失败
    pause
    exit /b 1
)

echo [3/5] 构建前端Next.js镜像...
docker-compose build frontend
if %errorlevel% neq 0 (
    echo [错误] 前端镜像构建失败
    pause
    exit /b 1
)

echo [4/5] 启动所有服务...
docker-compose up -d
if %errorlevel% neq 0 (
    echo [错误] 服务启动失败
    pause
    exit /b 1
)

echo [5/5] 等待服务启动...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo ✅ CMDB系统部署成功！
echo ========================================
echo.
echo 访问地址：
echo   - 前端应用: http://localhost:3000
echo   - 后端API: http://localhost:8081
echo   - Consul UI: http://localhost:8500
echo.
echo 默认登录账号：
echo   用户名: admin
echo   密码: admin123
echo.
echo AI助手功能已启用（智普AI）
echo.
echo 按任意键查看容器状态...
pause >nul

docker-compose ps

echo.
echo 提示：
echo - 使用 'docker-compose logs -f' 查看日志
echo - 使用 'docker-compose down' 停止服务
echo - 运行 'test-system-integration.ps1' 进行系统测试
echo.
pause