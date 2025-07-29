# CMDB 系统启动选项指南

现在 CMDB 系统提供了多种启动方式，满足不同的使用场景。

## 🚀 启动选项总览

### 1. **生产环境启动** ⭐ 推荐
使用完整的 Docker Compose + nginx 反向代理

**Linux/Mac:**
```bash
./start-production.sh
```

**Windows:**
```bat
start-production.bat
```

**特点:**
- ✅ **nginx 反向代理** - 完整的 Web 服务器功能
- ✅ **静态资源优化** - gzip 压缩、缓存控制
- ✅ **安全头** - XSS 保护、内容类型检测
- ✅ **SPA 路由支持** - React Router history 模式
- ✅ **API 代理** - `/api/*` 自动转发到后端
- ✅ **生产级构建** - 优化的 React 构建包
- ✅ **容器化部署** - 所有服务都在 Docker 中运行

### 2. **标准启动** (现已升级为生产模式)
现在 `start.sh` 和 `start.bat` 已升级为使用 docker-compose + nginx

**Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```bat
start.bat
```

### 3. **开发模式启动**
使用本地 npm start + Go 运行，便于开发调试

**Linux/Mac:**
```bash
./start-dev.sh
```

**Windows:**
```bat
start-dev.bat
```

**特点:**
- 🛠️ **热重载** - React 组件实时更新
- 🛠️ **开发调试** - 完整的开发工具
- 🛠️ **直接API访问** - 无 nginx 代理，便于调试
- 🛠️ **快速启动** - 不需要构建 Docker 镜像

### 4. **简单启动** (开发用)
最简化的启动方式，适合快速测试

**Linux/Mac:**
```bash
./start-simple.sh
```

**Windows:**
```bat
start-simple.bat
```

## 🌐 nginx 配置详情

### nginx 功能特性
当使用生产模式时，nginx 提供以下功能：

1. **反向代理**
   ```
   http://localhost:3000/api/* → http://cmdb-api:8081/api/*
   ```

2. **静态资源优化**
   - Gzip 压缩 (减少 70% 传输量)
   - 静态资源缓存 (1年过期时间)
   - 内容类型优化

3. **安全特性**
   ```nginx
   X-Frame-Options: SAMEORIGIN
   X-XSS-Protection: 1; mode=block
   X-Content-Type-Options: nosniff
   ```

4. **SPA 路由支持**
   - 处理 React Router 的 history 模式
   - 404 自动回退到 `index.html`

### nginx 配置文件位置
- 配置文件: `nginx.conf`
- 在生产模式下自动应用

## 📊 启动方式对比

| 特性 | 生产模式 | 开发模式 | 简单模式 |
|------|----------|----------|----------|
| nginx 反向代理 | ✅ | ❌ | ❌ |
| 静态资源优化 | ✅ | ❌ | ❌ |
| 热重载 | ❌ | ✅ | ✅ |
| 容器化部署 | ✅ | 部分 | 部分 |
| 启动速度 | 慢 | 快 | 最快 |
| 适用场景 | 生产/演示 | 开发调试 | 快速测试 |

## 🔧 管理命令

### 生产模式管理 (docker-compose)
```bash
# 停止所有服务
docker-compose down

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 扩容后端服务
docker-compose up -d --scale cmdb-api=2

# 重新构建并启动
docker-compose up -d --build
```

### 开发模式管理
```bash
# 停止服务: Ctrl+C
# 查看日志: 直接在终端查看
# 重启: 重新运行启动脚本
```

## 🎯 推荐使用场景

- **演示/生产**: 使用 `start-production.sh` 获得完整的 nginx 功能
- **日常开发**: 使用 `start-dev.sh` 获得最佳开发体验  
- **快速测试**: 使用 `start-simple.sh` 最快启动系统
- **CI/CD**: 使用 `docker-compose up -d --build` 自动化部署

## 🌍 访问地址

无论使用哪种方式，访问地址都是：
- **前端**: http://localhost:3000
- **后端API**: http://localhost:8081/api/v1
- **MongoDB**: localhost:27017
- **Consul**: http://localhost:8500

**区别在于**:
- 生产模式: 前端由 nginx 服务，API 请求经过 nginx 代理
- 开发模式: 前端由 React 开发服务器提供，API 请求直接访问后端 