# 智普AI集成配置指南

## 概述

CMDB系统现已集成智普AI (GLM-4)，为AI助手提供强大的自然语言对话能力。

## 配置步骤

### 1. 获取智普AI API密钥

1. 访问 [智普AI开放平台](https://open.bigmodel.cn/)
2. 注册账号并登录
3. 在控制台中创建API密钥
4. 复制您的API密钥

### 2. 配置环境变量

在后端项目中设置环境变量：

```bash
# 方式1：直接设置环境变量
export ZHIPU_API_KEY=your-api-key-here

# 方式2：创建.env文件 (推荐)
echo "ZHIPU_API_KEY=your-api-key-here" >> backend/.env
```

### 3. Docker环境配置

在 `docker-compose.yml` 中添加环境变量：

```yaml
services:
  cmdb-api:
    environment:
      - ZHIPU_API_KEY=your-api-key-here
```

## 功能特性

### 🤖 智能对话
- 自然语言理解和回复
- 中英文双语支持
- 上下文感知对话

### 📊 数据集成
- AI回复结合实时系统数据
- 智能建议基于当前系统状态
- 权限感知的响应内容

### 🔄 备用方案
- 无API密钥时自动回退到模拟响应
- 网络错误时使用规则引擎
- 确保服务稳定性

## API使用示例

### 基础对话
```json
POST /api/v1/ai/chat
{
  "message": "帮我查看服务器资产状况",
  "language": "zh"
}
```

### 响应格式
```json
{
  "message": "AI生成的回复内容...",
  "intent": "query_assets",
  "data": { /* 相关数据 */ },
  "suggestions": ["查看详细资产", "检查资产状态"],
  "timestamp": "2024-01-20T10:30:00Z"
}
```

## 成本优化

### 模型选择
- 默认使用 `glm-4-flash`：速度快，成本低
- 可配置为其他模型：`glm-4`, `glm-4-air`

### 请求优化
- 智能意图识别，减少不必要的API调用
- 数据缓存和请求去重
- 合理的超时和重试机制

## 故障排除

### 常见问题

1. **API密钥错误**
   ```
   Warning: ZHIPU_API_KEY not set, AI chat will use mock responses
   ```
   解决：检查环境变量配置

2. **网络连接失败**
   - 检查网络连接
   - 确认API服务状态
   - 查看防火墙设置

3. **配额不足**
   - 检查智普AI账户余额
   - 升级套餐或充值

### 调试日志

启用详细日志：
```bash
export LOG_LEVEL=debug
```

查看AI服务日志：
```bash
docker logs cmdb-api | grep -i zhipu
```

## 安全注意事项

1. **API密钥保护**
   - 不要在代码中硬编码API密钥
   - 使用环境变量或密钥管理服务
   - 定期轮换API密钥

2. **请求限制**
   - 实施速率限制
   - 用户权限验证
   - 输入内容过滤

3. **数据隐私**
   - 敏感数据脱敏
   - 请求日志管理
   - 符合数据保护法规

## 性能监控

### 关键指标
- API响应时间
- 请求成功率
- 错误率和类型
- 成本消耗

### 监控方式
```bash
# 查看AI服务性能
curl http://localhost:8080/api/v1/ai/suggestions

# 监控API调用
grep "Zhipu API" /var/log/cmdb/api.log
```

## 更新和维护

### 版本更新
```bash
cd backend
go get -u github.com/itcwc/go-zhipu
go mod tidy
```

### 配置验证
```bash
# 测试API连接
curl -X POST http://localhost:8080/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "测试", "language": "zh"}'
```

---

如需技术支持，请参考项目文档或提交Issue。