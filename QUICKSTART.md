# CMDB 快速启动指南

## 🚀 30秒快速启动

### Windows用户
```powershell
# 克隆项目（如果还没有）
git clone https://github.com/phuhao00/cmdb.git
cd cmdb

# 一键启动所有服务
.\scripts\deploy-nextjs.bat
```

### Linux/Mac用户
```bash
# 克隆项目（如果还没有）
git clone https://github.com/phuhao00/cmdb.git
cd cmdb

# 一键启动所有服务
./scripts/deploy-nextjs.sh
```

## 🌐 访问系统

启动完成后，打开浏览器访问：
- **系统主页**: http://localhost:3000
- **默认账号**: admin / admin123

## 📋 功能概览

### 1. 资产管理
- 添加、编辑、删除IT资产
- 支持服务器、网络设备、存储、工作站等类型
- 标签管理和高级搜索
- 批量导入导出（Excel/CSV）

### 2. 工作流审批
- 资产变更自动创建工作流
- 多级审批流程
- 飞书通知集成

### 3. 数据可视化
- 实时资产状态看板
- 成本分析图表
- 资产分布统计

### 4. 审计日志
- 完整的操作记录
- 用户行为追踪
- 合规性支持

### 5. AI助手
- 智能问答
- 系统操作建议
- 自然语言交互

## 🛠️ 常用命令

### 查看服务状态
```powershell
docker ps
```

### 查看日志
```powershell
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 停止服务
```powershell
docker-compose down
```

### 重启服务
```powershell
.\scripts\rebuild-and-restart.bat  # Windows
./scripts/rebuild-and-restart.sh   # Linux/Mac
```

## 📱 主要功能入口

1. **资产管理**: 左侧菜单 → 资产管理
2. **工作流**: 左侧菜单 → 工作流
3. **报表**: 左侧菜单 → 报告
4. **审计日志**: 左侧菜单 → 审计日志
5. **AI助手**: 右下角聊天图标

## 🔧 常见问题

### 1. 端口被占用
如果3000或8081端口被占用，修改`docker-compose.yml`中的端口映射。

### 2. 登录失败
确保MongoDB服务正常运行，初始管理员账号已创建。

### 3. 前端页面空白
清除浏览器缓存，或使用无痕模式访问。

### 4. Docker启动失败
确保Docker Desktop正在运行，并分配了足够的资源（建议4GB内存）。

## 📞 需要帮助？

- 查看详细文档: [README.md](README.md)
- 提交问题: https://github.com/phuhao00/cmdb/issues
- AI助手: 系统内置的智能助手可以回答大部分使用问题

## 🎯 下一步

1. 探索资产管理功能
2. 创建第一个工作流
3. 生成资产报表
4. 配置告警规则
5. 使用AI助手优化工作

祝您使用愉快！🎉