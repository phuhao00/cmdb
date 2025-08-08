# CMDB 后端新功能说明

本文档介绍了 CMDB 后端新增的高级功能。

## 1. 优雅关闭 (Graceful Shutdown)

系统现在支持优雅关闭，可以通过 `SIGINT` (Ctrl+C) 或 `SIGTERM` 信号触发：

- 等待正在处理的请求完成（最多 30 秒）
- 正确关闭数据库连接
- 清理资源

```bash
# 优雅关闭服务
kill -TERM <pid>
```

## 2. 请求日志中间件

所有 HTTP 请求都会被记录，包含以下信息：

- 客户端 IP
- 时间戳
- HTTP 方法和路径
- 响应状态码
- 请求延迟
- User-Agent

日志格式示例：
```
127.0.0.1 - [Mon, 02 Jan 2006 15:04:05 MST] "GET /api/assets HTTP/1.1 200 142.123µs "Mozilla/5.0..."
```

## 3. 速率限制

默认配置：每分钟 60 个请求/IP

可通过环境变量自定义：
```bash
export RATE_LIMIT=100  # 每分钟 100 个请求
```

超出限制时返回 `429 Too Many Requests`

## 4. Swagger API 文档

访问 API 文档：
```
http://localhost:8080/swagger/index.html
```

### 生成/更新 Swagger 文档

首先安装 swag 工具：
```bash
go install github.com/swaggo/swag/cmd/swag@latest
```

然后在 backend 目录运行：
```bash
swag init
```

### 为 API 添加文档

在处理函数上添加注释：
```go
// GetAssets godoc
// @Summary 获取资产列表
// @Description 获取所有资产的列表，支持分页和过滤
// @Tags assets
// @Accept json
// @Produce json
// @Param page query int false "页码"
// @Param limit query int false "每页数量"
// @Success 200 {object} []model.Asset
// @Failure 401 {object} map[string]string
// @Router /assets [get]
// @Security BearerAuth
func (h *AssetHandler) GetAssets(c *gin.Context) {
    // ...
}
```

## 5. Prometheus 监控指标

访问指标端点：
```
http://localhost:8080/metrics
```

### 可用指标

1. **http_requests_total** - HTTP 请求总数
   - Labels: method, endpoint, status

2. **http_request_duration_seconds** - HTTP 请求持续时间
   - Labels: method, endpoint

3. **active_connections** - 活跃连接数
   - Labels: type (websocket)

### Prometheus 配置示例

```yaml
scrape_configs:
  - job_name: 'cmdb'
    static_configs:
      - targets: ['localhost:8080']
```

### Grafana 仪表板

可以导入以下查询创建仪表板：

```promql
# 请求速率
rate(http_requests_total[5m])

# 平均响应时间
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# 错误率
rate(http_requests_total{status=~"5.."}[5m])
```

## 6. WebSocket 实时通信

WebSocket 端点：`ws://localhost:8080/ws`

### 客户端连接示例

```javascript
// 需要认证 token
const ws = new WebSocket('ws://localhost:8080/ws?room=assets', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

ws.onopen = () => {
  console.log('WebSocket connected');
  
  // 发送心跳
  ws.send(JSON.stringify({
    type: 'ping'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// 广播消息到房间
ws.send(JSON.stringify({
  type: 'broadcast',
  content: {
    message: 'Asset updated',
    assetId: '123'
  }
}));
```

### 服务端推送

在其他模块中使用 WebSocket 推送消息：

```go
// 向特定房间广播
BroadcastToRoom("assets", map[string]interface{}{
    "event": "asset_created",
    "asset": newAsset,
})

// 向特定用户发送
BroadcastToUser(userID, map[string]interface{}{
    "event": "notification",
    "message": "Your request has been approved",
})
```

### WebSocket 消息类型

1. **ping/pong** - 心跳保活
2. **broadcast** - 广播消息
3. 自定义业务消息

### 房间概念

- 通过 URL 参数 `room` 指定房间
- 同一房间内的客户端可以接收广播消息
- 不指定房间则为全局房间

## 环境变量配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| PORT | 8080 | 服务端口 |
| MONGO_URI | mongodb://localhost:27017 | MongoDB 连接字符串 |
| GIN_MODE | release | Gin 运行模式 |
| RATE_LIMIT | 60 | 每分钟请求限制 |

## 开发建议

1. **日志级别**：生产环境建议使用 `release` 模式减少日志输出

2. **监控告警**：基于 Prometheus 指标设置告警规则
   - 响应时间 > 1s
   - 错误率 > 5%
   - WebSocket 连接数异常

3. **WebSocket 使用场景**：
   - 实时通知
   - 资产状态变更推送
   - 审批流程实时更新
   - 多用户协作

4. **性能优化**：
   - 根据实际负载调整速率限制
   - 监控内存使用，优化 WebSocket 连接管理
   - 使用 Redis 替代内存存储实现分布式速率限制

## 故障排查

### WebSocket 连接失败

1. 检查认证 token 是否有效
2. 确认 CORS 配置允许 WebSocket 连接
3. 查看浏览器控制台错误信息

### Swagger 文档不显示

1. 确保已运行 `swag init` 生成文档
2. 检查 `backend/docs` 目录是否存在
3. 确认访问路径正确

### Prometheus 指标缺失

1. 确认中间件已正确注册
2. 检查 `/metrics` 端点是否可访问
3. 验证 Prometheus 配置正确