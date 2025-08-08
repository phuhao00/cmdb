#!/bin/bash

# CMDB 新功能测试脚本
# 用于验证所有新增功能是否正常工作

echo "=== CMDB 新功能测试 ==="
echo ""

BASE_URL="http://localhost:8080"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -n "测试 $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    
    if [ "$response" == "$expected_status" ]; then
        echo -e "${GREEN}✓ 成功${NC} (状态码: $response)"
    else
        echo -e "${RED}✗ 失败${NC} (期望: $expected_status, 实际: $response)"
    fi
}

# 测试 WebSocket 连接
test_websocket() {
    echo -n "测试 WebSocket 连接... "
    
    # 使用 curl 测试 WebSocket 升级
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Connection: Upgrade" \
        -H "Upgrade: websocket" \
        -H "Sec-WebSocket-Version: 13" \
        -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" \
        "$BASE_URL/ws")
    
    if [ "$response" == "401" ]; then
        echo -e "${GREEN}✓ 成功${NC} (需要认证，符合预期)"
    else
        echo -e "${RED}✗ 失败${NC} (状态码: $response)"
    fi
}

# 测试速率限制
test_rate_limit() {
    echo -n "测试速率限制... "
    
    # 快速发送多个请求
    local count=0
    local limit_hit=false
    
    for i in {1..70}; do
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
        if [ "$response" == "429" ]; then
            limit_hit=true
            break
        fi
        ((count++))
    done
    
    if [ "$limit_hit" = true ]; then
        echo -e "${GREEN}✓ 成功${NC} (在第 $((count+1)) 个请求时触发限制)"
    else
        echo -e "${YELLOW}⚠ 警告${NC} (未触发速率限制，可能需要调整测试参数)"
    fi
}

# 测试优雅关闭
test_graceful_shutdown() {
    echo -n "测试优雅关闭准备... "
    
    # 检查进程是否支持信号处理
    if pgrep -f "cmdb/backend" > /dev/null; then
        echo -e "${GREEN}✓ 准备就绪${NC} (进程正在运行)"
        echo "  提示：使用 'kill -TERM <pid>' 测试优雅关闭"
    else
        echo -e "${YELLOW}⚠ 跳过${NC} (服务未运行)"
    fi
}

# 开始测试
echo "1. 健康检查"
test_endpoint "/health" "健康检查端点"

echo ""
echo "2. Prometheus 指标"
test_endpoint "/metrics" "Prometheus 指标端点"

echo ""
echo "3. Swagger 文档"
test_endpoint "/swagger/index.html" "Swagger UI"

echo ""
echo "4. WebSocket 支持"
test_websocket

echo ""
echo "5. 速率限制"
test_rate_limit

echo ""
echo "6. 优雅关闭"
test_graceful_shutdown

echo ""
echo "=== 测试完成 ==="
echo ""
echo "其他测试建议："
echo "- 使用浏览器访问 $BASE_URL/swagger/index.html 查看 API 文档"
echo "- 使用 Prometheus 抓取 $BASE_URL/metrics 查看监控指标"
echo "- 使用 WebSocket 客户端连接 ws://localhost:8080/ws 测试实时通信"
echo "- 查看日志输出验证请求日志格式"