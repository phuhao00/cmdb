# CMDB 新功能测试脚本 (PowerShell 版本)
# 用于验证所有新增功能是否正常工作

Write-Host "=== CMDB 新功能测试 ===" -ForegroundColor Cyan
Write-Host ""

$BaseUrl = "http://localhost:8080"

# 测试函数
function Test-Endpoint {
    param(
        [string]$Endpoint,
        [string]$Description,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host -NoNewline "测试 $Description... "
    
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl$Endpoint" -Method Get -UseBasicParsing -ErrorAction SilentlyContinue
        $statusCode = $response.StatusCode
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
    }
    
    if ($statusCode -eq $ExpectedStatus) {
        Write-Host "✓ 成功" -ForegroundColor Green -NoNewline
        Write-Host " (状态码: $statusCode)"
    }
    else {
        Write-Host "✗ 失败" -ForegroundColor Red -NoNewline
        Write-Host " (期望: $ExpectedStatus, 实际: $statusCode)"
    }
}

# 测试 WebSocket 连接
function Test-WebSocket {
    Write-Host -NoNewline "测试 WebSocket 连接... "
    
    try {
        $headers = @{
            "Connection" = "Upgrade"
            "Upgrade" = "websocket"
            "Sec-WebSocket-Version" = "13"
            "Sec-WebSocket-Key" = "x3JJHMbDL1EzLkh9GBhXDw=="
        }
        
        $response = Invoke-WebRequest -Uri "$BaseUrl/ws" -Headers $headers -Method Get -UseBasicParsing -ErrorAction SilentlyContinue
        $statusCode = $response.StatusCode
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
    }
    
    if ($statusCode -eq 401) {
        Write-Host "✓ 成功" -ForegroundColor Green -NoNewline
        Write-Host " (需要认证，符合预期)"
    }
    else {
        Write-Host "✗ 失败" -ForegroundColor Red -NoNewline
        Write-Host " (状态码: $statusCode)"
    }
}

# 测试速率限制
function Test-RateLimit {
    Write-Host -NoNewline "测试速率限制... "
    
    $count = 0
    $limitHit = $false
    
    for ($i = 1; $i -le 70; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "$BaseUrl/health" -Method Get -UseBasicParsing -ErrorAction SilentlyContinue
            $statusCode = $response.StatusCode
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
        }
        
        if ($statusCode -eq 429) {
            $limitHit = $true
            break
        }
        $count++
    }
    
    if ($limitHit) {
        Write-Host "✓ 成功" -ForegroundColor Green -NoNewline
        Write-Host " (在第 $($count + 1) 个请求时触发限制)"
    }
    else {
        Write-Host "⚠ 警告" -ForegroundColor Yellow -NoNewline
        Write-Host " (未触发速率限制，可能需要调整测试参数)"
    }
}

# 测试优雅关闭
function Test-GracefulShutdown {
    Write-Host -NoNewline "测试优雅关闭准备... "
    
    $process = Get-Process | Where-Object { $_.Path -like "*cmdb*backend*" }
    
    if ($process) {
        Write-Host "✓ 准备就绪" -ForegroundColor Green -NoNewline
        Write-Host " (进程正在运行，PID: $($process.Id))"
        Write-Host "  提示：使用 'Stop-Process -Id $($process.Id) -Force:$false' 测试优雅关闭"
    }
    else {
        Write-Host "⚠ 跳过" -ForegroundColor Yellow -NoNewline
        Write-Host " (服务未运行)"
    }
}

# 测试 Prometheus 指标内容
function Test-PrometheusMetrics {
    Write-Host -NoNewline "验证 Prometheus 指标内容... "
    
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/metrics" -Method Get -UseBasicParsing
        $content = $response.Content
        
        $metricsFound = @()
        if ($content -match "http_requests_total") { $metricsFound += "http_requests_total" }
        if ($content -match "http_request_duration_seconds") { $metricsFound += "http_request_duration_seconds" }
        if ($content -match "active_connections") { $metricsFound += "active_connections" }
        
        if ($metricsFound.Count -eq 3) {
            Write-Host "✓ 成功" -ForegroundColor Green -NoNewline
            Write-Host " (找到所有指标)"
        }
        else {
            Write-Host "⚠ 部分成功" -ForegroundColor Yellow -NoNewline
            Write-Host " (找到 $($metricsFound.Count)/3 个指标)"
        }
    }
    catch {
        Write-Host "✗ 失败" -ForegroundColor Red -NoNewline
        Write-Host " (无法获取指标)"
    }
}

# 开始测试
Write-Host "1. 健康检查" -ForegroundColor Yellow
Test-Endpoint -Endpoint "/health" -Description "健康检查端点"

Write-Host ""
Write-Host "2. Prometheus 指标" -ForegroundColor Yellow
Test-Endpoint -Endpoint "/metrics" -Description "Prometheus 指标端点"
Test-PrometheusMetrics

Write-Host ""
Write-Host "3. Swagger 文档" -ForegroundColor Yellow
Test-Endpoint -Endpoint "/swagger/index.html" -Description "Swagger UI"

Write-Host ""
Write-Host "4. WebSocket 支持" -ForegroundColor Yellow
Test-WebSocket

Write-Host ""
Write-Host "5. 速率限制" -ForegroundColor Yellow
Test-RateLimit

Write-Host ""
Write-Host "6. 优雅关闭" -ForegroundColor Yellow
Test-GracefulShutdown

Write-Host ""
Write-Host "=== 测试完成 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "其他测试建议：" -ForegroundColor White
Write-Host "- 使用浏览器访问 $BaseUrl/swagger/index.html 查看 API 文档"
Write-Host "- 使用 Prometheus 抓取 $BaseUrl/metrics 查看监控指标"
Write-Host "- 使用 WebSocket 客户端连接 ws://localhost:8080/ws 测试实时通信"
Write-Host "- 查看日志输出验证请求日志格式"
Write-Host ""
Write-Host "运行服务器命令：" -ForegroundColor White
Write-Host "  cd backend"
Write-Host "  go run main.go"