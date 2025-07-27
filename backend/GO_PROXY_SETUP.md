# Go代理设置说明

## 已配置的代理设置

本项目已在以下位置配置了Go代理设置，以加速中国地区的依赖下载：

### Docker环境
- **Dockerfile**: 在构建镜像时使用代理
- **docker-compose.yml**: 在运行时使用代理

### 配置的代理

```bash
GOPROXY=https://goproxy.cn,direct
GOSUMDB=sum.golang.google.cn
GO111MODULE=on
```

## 本地开发设置

如果你需要在本地开发时也使用Go代理，可以执行以下命令：

### Windows (PowerShell)
```powershell
$env:GOPROXY="https://goproxy.cn,direct"
$env:GOSUMDB="sum.golang.google.cn"
$env:GO111MODULE="on"
```

### Linux/macOS (Bash)
```bash
export GOPROXY=https://goproxy.cn,direct
export GOSUMDB=sum.golang.google.cn
export GO111MODULE=on
```

### 永久设置
将上述环境变量添加到你的shell配置文件中（如 `.bashrc`, `.zshrc`, 或PowerShell profile）。

## 备用代理

如果默认代理不可用，可以尝试以下替代方案：

```bash
# 阿里云镜像
GOPROXY=https://mirrors.aliyun.com/goproxy/,direct

# 官方代理
GOPROXY=https://proxy.golang.org,direct

# 七牛云代理
GOPROXY=https://goproxy.qiniu.com,direct
```

## 验证设置

运行以下命令验证代理设置是否生效：

```bash
go env GOPROXY
go env GOSUMDB
```

## 清理模块缓存

如果之前下载的模块有问题，可以清理缓存：

```bash
go clean -modcache
``` 