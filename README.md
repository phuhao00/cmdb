# CMDB - 配置管理数据库系统

一个现代化的配置管理数据库(CMDB)系统，用于跟踪IT资产并集成审批工作流，专为IDC(互联网数据中心)和数据中心运营而设计。

![CMDB System Interface](im.png)

## 🚀 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS + Lucide React
- **后端**: Go + Gin框架 + MongoDB
- **AI集成**: 智普AI智能聊天助手
- **容器化**: Docker & Docker Compose
- **服务发现**: Consul微服务架构

## ✨ 核心功能

### 资产管理
- 📦 全面的IT资产跟踪（服务器、网络设备、存储、工作站）
- 🔄 资产状态监控（在线、离线、维护、报废）
- 📊 资产详情记录（位置、描述、成本信息）
- 📥 批量资产导入导出
- 🔧 资产生命周期管理

### 工作流管理
- ✅ 集成的审批工作流
- 🔔 状态变更请求自动创建工作流
- 📅 维护计划审批流程
- 🔚 报废工作流管理
- 🚀 飞书Webhook集成

### 仪表板与可视化
- 📈 实时资产状态概览
- 📊 交互式图表展示
- 💰 成本可视化分析
- 🔍 关键资产监控
- 📋 最近活动跟踪

### AI智能助手
- 💬 智普AI集成的智能对话
- 🤖 自然语言交互
- 💡 智能建议和分析
- 🔍 系统信息查询

### 报表系统
- 📑 库存报表导出CSV
- 📅 生命周期报表
- ✔️ 合规性报表

## 🛠️ 快速开始

### 前置要求
- Docker和Docker Compose
- Node.js >= 14.0.0
- Go (最新稳定版本)

### 使用Docker Compose部署（推荐）

```bash
# 克隆仓库
git clone <repository-url>
cd cmdb

# 一键部署
./scripts/deploy-nextjs.sh   # Linux/Mac
scripts\deploy-nextjs.bat    # Windows

# 或使用docker-compose直接启动
docker-compose up -d
```

### 访问地址
- 前端应用: http://localhost:3000
- 后端API: http://localhost:8081
- Consul UI: http://localhost:8500

### 默认登录凭证
- 用户名: `admin`
- 密码: `admin123`

## 🔧 开发指南

### 后端开发
```bash
cd backend
go run main.go
```

### 前端开发
```bash
cd frontend
npm install
npm run dev
```

## 📚 API文档

### 资产管理API
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/v1/assets` | 获取所有资产 |
| POST | `/api/v1/assets` | 创建新资产 |
| GET | `/api/v1/assets/:id` | 获取指定资产 |
| PUT | `/api/v1/assets/:id` | 更新资产信息 |
| DELETE | `/api/v1/assets/:id` | 删除资产 |
| GET | `/api/v1/assets/stats` | 获取资产统计 |
| GET | `/api/v1/assets/types` | 获取资产类型分布 |
| GET | `/api/v1/assets/locations` | 获取资产位置分布 |
| GET | `/api/v1/assets/costs` | 获取资产成本汇总 |

### 工作流API
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/v1/workflows` | 获取所有工作流 |
| POST | `/api/v1/workflows` | 创建新工作流 |
| GET | `/api/v1/workflows/:id` | 获取指定工作流 |
| PUT | `/api/v1/workflows/:id/approve` | 批准工作流 |
| PUT | `/api/v1/workflows/:id/reject` | 拒绝工作流 |
| GET | `/api/v1/workflows/stats` | 获取工作流统计 |

### 报表API
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/v1/reports/inventory` | 生成库存报表 |
| GET | `/api/v1/reports/lifecycle` | 生成生命周期报表 |
| GET | `/api/v1/reports/compliance` | 生成合规性报表 |

### AI聊天API
| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/ai/chat` | 发送AI聊天请求 |

## 🏗️ 系统架构

```
cmdb/
├── frontend/                  # Next.js 14前端
│   ├── src/
│   │   ├── app/              # App Router页面
│   │   ├── components/       # React组件
│   │   ├── contexts/         # Context API
│   │   └── services/         # API服务
│   └── Dockerfile.nextjs     # 前端Docker镜像
├── backend/                   # Go后端
│   ├── application/          # 应用层
│   ├── domain/               # 领域层
│   ├── infrastructure/       # 基础设施层
│   ├── interfaces/           # 接口层
│   ├── main.go               # 主程序
│   └── Dockerfile            # 后端Docker镜像
├── docker-compose.yml         # Docker Compose配置
├── scripts/                   # 部署和启动脚本
│   ├── deploy-nextjs.bat     # Windows部署脚本
│   ├── deploy-nextjs.sh      # Linux/Mac部署脚本
│   ├── start*.bat            # 各种Windows启动脚本
│   └── start*.sh             # 各种Linux/Mac启动脚本
├── im.png                     # 系统截图
├── LICENSE                    # MIT许可证
└── nginx.conf                 # Nginx配置（可选）
```

## 🔐 环境配置

### 后端环境变量
```yaml
MONGO_URI: mongodb://admin:password123@mongodb:27017/cmdb?authSource=admin
CONSUL_ADDRESS: consul:8500
PORT: 8081
ZHIPU_API_KEY: your-api-key-here
```

### 前端环境变量
```yaml
NEXT_PUBLIC_API_BASE_URL: http://localhost:8081/api/v1
NEXT_PUBLIC_AI_API_BASE_URL: http://localhost:8081/api
```

## 🤖 AI助手配置

系统集成了智普AI聊天助手：

1. 从[智普AI](https://open.bigmodel.cn/)获取API密钥
2. 在`docker-compose.yml`中设置环境变量：
   ```yaml
   ZHIPU_API_KEY: your-api-key-here
   ```
3. AI助手将出现在仪表板右下角

## 📦 数据库初始化

系统首次运行时会自动初始化数据库，包括：
- 16个示例资产（服务器、网络设备、存储、工作站）
- 8个示例工作流（已批准、待处理、已拒绝）
- 优化的索引以提高查询性能

## 🚀 部署选项

### 选项1: Docker Compose（推荐）
```bash
docker-compose up -d
```

### 选项2: 启动脚本
```bash
# 完整系统启动（包含所有服务）
./scripts/start.sh          # Linux/Mac
scripts\start.bat           # Windows

# 简单启动（仅后端和前端）
./scripts/start-simple.sh   # Linux/Mac
scripts\start-simple.bat    # Windows

# 开发模式启动
./scripts/start-dev.sh      # Linux/Mac
scripts\start-dev.bat       # Windows
```

## 📋 系统要求

- **操作系统**: Windows, Linux, macOS
- **Docker**: 20.10+
- **Docker Compose**: 1.29+
- **内存**: 最少4GB RAM
- **存储**: 最少10GB可用空间

## 🔄 更新日志

### v1.0.0 (2025年1月)
- ✅ 完成Next.js 14前端迁移
- ✅ 集成智普AI聊天功能
- ✅ 优化Docker部署流程
- ✅ 完善API文档
- ✅ 增强系统性能

## 🤝 贡献指南

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看[LICENSE](LICENSE)文件了解详情

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Gin](https://gin-gonic.com/) - Go Web框架
- [MongoDB](https://www.mongodb.com/) - NoSQL数据库
- [智普AI](https://open.bigmodel.cn/) - AI服务提供商
- [Docker](https://www.docker.com/) - 容器化平台

---

**项目状态**: ✅ 生产就绪  
**维护状态**: 活跃开发中  
**最后更新**: 2025年1月