# MiniIO 安装与配置

## 安装方法

### 方法一：使用可执行文件（推荐）

1. **下载 MiniIO**
   - 访问 [MiniIO 官网](https://min.io/download) 下载适合你操作系统的可执行文件
   - 或者使用命令行下载：
     - Windows: `Invoke-WebRequest -Uri "https://dl.min.io/server/minio/release/windows-amd64/minio.exe" -OutFile "minio.exe"`
     - Linux: `wget https://dl.min.io/server/minio/release/linux-amd64/minio`
     - macOS: `curl -O https://dl.min.io/server/minio/release/darwin-amd64/minio`

2. **设置环境变量（可选）**
   - 将 MiniIO 可执行文件所在目录添加到系统 PATH 环境变量中，方便在任何位置运行

3. **运行 MiniIO**
   - 创建一个目录用于存储数据，例如 `D:\minio-data`
   - 打开命令提示符，进入 MiniIO 可执行文件所在目录
   - 运行命令：`minio.exe server D:\minio-data`
   - 看到类似以下输出表示启动成功：
     ```
     MinIO Object Storage Server 
     Copyright: 2015-2024 MinIO, Inc.
     License: GNU AGPLv3 <https://www.gnu.org/licenses/agpl-3.0.html>
     Version: RELEASE.2024-04-13T03-03-47Z (go1.21.8 windows/amd64)

     API: http://127.0.0.1:9000  http://192.168.1.100:9000 
     Console: http://127.0.0.1:9001 http://192.168.1.100:9001 

     Documentation: https://min.io/docs/minio/linux/index.html
     ```

### 方法二：使用 Docker

如果你已经安装了 Docker，可以使用 Docker 运行 MiniIO：

```bash
docker run -p 9000:9000 -p 9001:9001 --name minio1 \
  -v D:\minio-data:/data \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=password123" \
  quay.io/minio/minio server /data --console-address ":9001"
```

## 配置步骤

### 1. 访问 MiniIO 控制台

- 打开浏览器，访问 `http://localhost:9001`
- 使用默认凭据登录：
  - 用户名：`minioadmin`
  - 密码：`minioadmin`
  - （如果使用 Docker 运行，使用你设置的用户名和密码）

### 2. 创建存储桶（Bucket）

1. 登录控制台后，点击左侧的 "Buckets" 
2. 点击 "Create Bucket" 按钮
3. 输入存储桶名称，例如 "my-bucket"
4. 点击 "Create Bucket" 完成创建

### 3. 创建访问密钥

1. 点击左侧的 "Identity" -> "Service Accounts"
2. 点击 "Create Service Account"
3. 输入名称，例如 "my-service-account"
4. 点击 "Create"
5. 保存生成的 "Access Key" 和 "Secret Key"，这些将用于代码中访问 MiniIO

### 4. 配置存储桶权限

1. 点击左侧的 "Buckets"，选择你创建的存储桶
2. 点击 "Access Policy" 标签
3. 选择合适的访问策略，例如 "Public"、"Private" 或 "Custom"
4. 点击 "Save" 保存设置

## 环境变量配置

MiniIO 支持通过环境变量进行配置，常用的环境变量包括：

- **MINIO_ROOT_USER**：根用户用户名
- **MINIO_ROOT_PASSWORD**：根用户密码
- **MINIO_BROWSER**：是否启用控制台（on/off）
- **MINIO_CONSOLE_ADDRESS**：控制台地址
- **MINIO_SERVER_URL**：服务器 URL

例如，在 Windows 中设置环境变量：

```powershell
$env:MINIO_ROOT_USER = "admin"
$env:MINIO_ROOT_PASSWORD = "password123"
minio.exe server D:\minio-data
```

## 验证安装

1. **检查服务状态**：确保 MiniIO 服务正在运行
2. **访问控制台**：打开 `http://localhost:9001` 并登录
3. **创建测试存储桶**：创建一个测试存储桶并上传一个文件
4. **使用命令行工具**：使用 `mc` 命令行工具测试连接

## 常见问题

### 1. 端口被占用

**问题**：启动时提示端口 9000 或 9001 被占用
**解决方案**：
- 检查是否有其他服务占用了这些端口
- 使用 `--address` 参数指定不同的端口，例如：`minio.exe server --address :9002 D:\minio-data`

### 2. 权限错误

**问题**：启动时提示权限不足
**解决方案**：
- 确保运行 MiniIO 的用户有数据目录的读写权限
- 以管理员身份运行命令提示符

### 3. 数据目录问题

**问题**：启动时提示数据目录不存在或无法访问
**解决方案**：
- 确保指定的数据目录存在
- 确保用户有该目录的访问权限

## 总结

安装和配置 MiniIO 是使用它的第一步。通过本教程，你已经学会了如何：

1. 下载和安装 MiniIO
2. 启动 MiniIO 服务
3. 访问和使用 MiniIO 控制台
4. 创建存储桶和访问密钥
5. 配置存储桶权限
6. 解决常见的安装问题

在接下来的教程中，我们将学习如何使用 Java 客户端与 MiniIO 交互，实现文件的上传、下载和管理。