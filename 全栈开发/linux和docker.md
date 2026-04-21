基于你完成的前后端分离部署实操（前端 Vite+Nginx、后端 MySQL+Docker），整理以下 **4 个核心知识点**，覆盖脚本兼容、Nginx 部署、Windows 运维、Docker 数据库部署，均贴合你的实操场景：

### 知识点 1：Windows PowerShell 前端构建脚本兼容优化

#### 核心背景

前端项目（Vite）的 `build:win` 脚本需适配 Windows 环境，PowerShell 不支持 Linux/macOS 中的 `||` 逻辑运算符，导致原脚本执行失败。

#### 关键知识点

1. **不兼容原因**：
    - `||` 是 Unix shell（bash/zsh）的 “逻辑或”，PowerShell 不识别，会直接报错；
    - 原脚本 `rmdir /s /q dist 2>nul || exit 0 && vite build` 意图：删除旧 `dist` 目录（即使不存在也不报错），再执行构建。
2. **兼容修改逻辑**：
    - 用 `&` 替换 `|| exit 0 &&`，`&` 是 PowerShell 中的 “命令连接符”，无论前一个命令是否成功，都会执行后一个命令；
    - 优化后脚本：`rmdir /s /q dist 2>nul & vite build --mode production`，既保留 “删除旧目录 + 构建” 功能，又适配 Windows。
3. **验证标准**：
    
    执行 `npm run build:win` 后，项目根目录生成 `dist` 文件夹（含 `asset`、`favicon.ico`、`index.html`），即为构建成功。

### 知识点 2：Nginx 部署前端 + 反向代理核心配置

#### 核心作用

Nginx 作为前端静态资源服务器，同时解决 “前端跨域”（通过反向代理转发后端请求），是前后端分离部署的核心中间件。

#### 关键知识点

1. **前端部署三步曲**：
    - 第一步：前端 `npm run build` 生成 `dist` 静态文件；
    - 第二步：将 `dist` 内所有文件（`asset`、`favicon.ico`、`index.html`）复制到 Nginx 的 `html` 目录（或自定义目录）；
    - 第三步：修改 Nginx 配置文件（`nginx.conf`），重启 / 重载 Nginx 生效。
2. **nginx.conf 核心配置（反向代理 + 静态资源）**：
    
    nginx
    
    ```nginx
    server {
        listen 80;  # 前端访问端口（可修改为8080等，避免冲突）
        server_name localhost;
    
        # 静态资源指向（前端dist目录路径）
        root C:/nginx/html;  # 或你放置dist文件的自定义路径
        index index.html;  # 默认首页
    
        # 反向代理：解决前端跨域，转发后端请求（示例）
        location /api/ {  # 前端请求前缀（如axios.defaults.baseURL = '/api'）
            proxy_pass http://192.168.100.128:8080/;  # 后端服务地址（IP+端口）
            proxy_set_header Host $host;  # 传递请求主机名
            proxy_set_header X-Real-IP $remote_addr;  # 传递真实客户端IP
        }
    }
    ```
    
3. **Nginx 常用命令（Windows）**：
    - 重载配置（不重启服务）：`nginx.exe -s reload`（修改 `conf` 后必须执行）；
    - 停止服务：`nginx.exe -s stop`；
    - 注意：命令需在 Nginx 安装根目录执行（或配置环境变量）。

### 知识点 3：Windows 端口与进程管理实操（部署排障必备）

#### 核心场景

解决 “端口被占用”（如 Nginx 80 端口、前端 5173 端口冲突）、验证服务是否启动等问题。

#### 关键知识点

1. **查看端口占用**：
    
    命令：`netstat -ano | findstr :端口号`（如 `netstat -ano | findstr :8080`）；
    
    输出解读：`LISTENING` 表示端口被占用，最后一列数字是占用进程的 `PID`（如示例中的 12808）。
2. **强制终止占用进程**：
    
    命令：`taskkill /F /PID 进程PID`（如 `taskkill /F /PID 12808`）；
    
    参数说明：`/F` 强制终止（即使进程正在运行），`/PID` 指定进程 ID（通过上一步命令获取）。
3. **网络连通性测试**：
    
    命令：`ping 目标IP`（如 `ping 192.168.100.128`）；
    
    用途：验证前端服务器与后端服务器（或数据库服务器）是否网络互通，无丢包则说明网络正常。

