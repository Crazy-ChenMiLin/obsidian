# Redis 完整安装、配置与启动实操笔记

## 一、前置准备：安装 C 环境（Redis 依赖 C 编译）

Redis 基于 C 语言开发，需先安装编译依赖环境（以 CentOS 为例）：

```bash
# 安装gcc编译工具（Redis编译依赖）
yum install -y gcc gcc-c++
# 验证安装是否成功（显示版本号即正常）
gcc --version
```

## 二、Redis 安装与解压

1. 上传 Redis 安装包到服务器（如`/usr/local/src`目录，通过 XFTP 上传）；
2. 解压安装包：

```bash
# 进入上传目录
cd /usr/local/src
# 解压Redis压缩包（替换为实际文件名，如redis-6.2.6.tar.gz）
tar -zxvf redis-6.2.6.tar.gz
# 进入解压后的Redis目录
cd redis-6.2.6
```

3. 编译并安装 Redis：

```bash
# 编译（基于C环境编译源码）
make
# 安装（默认安装到/usr/local/bin目录，可通过PREFIX指定自定义路径）
make install
```

## 三、核心配置：修改 redis.conf（关键！影响连接与运行）

### 1. 备份配置文件（避免误改无法恢复）

```bash
# 进入Redis解压目录（确保在redis-6.2.6目录下）
cd /usr/local/src/redis-6.2.6
# 备份原配置文件（添加日期标识，方便回滚）
cp redis.conf redis.conf.bak.$(date +%Y%m%d)
# 验证备份是否成功（显示2个配置文件即正常）
ls -l redis.conf*
```

### 2. 编辑配置文件（vim 修改关键参数）

```bash
# 打开配置文件（使用vim编辑，按/关键词可快速搜索）
vim redis.conf
```

按以下要求修改核心参数（按`/关键词`搜索定位）：

|配置项|原配置（默认）|修改后配置|作用说明|
|---|---|---|---|
|bind|bind 127.0.0.1|bind 0.0.0.0|允许所有 IP 远程访问（默认仅本地 127.0.0.1）|
|protected-mode|protected-mode yes|protected-mode no|关闭保护模式（允许远程无绑定 IP 访问）|
|daemonize|daemonize no|daemonize yes|开启后台运行（避免终端关闭后 Redis 停止）|
|requirepass|# requirepass foobared|requirepass 你的密码|设置 Redis 连接密码（替换为实际密码，如 czqCZQ197623@）|
|port|port 6379|保持默认（或自定义端口）|Redis 默认端口，需确保防火墙开放|

保存退出：
按`ESC` → 输入`:wq` → 回车（

## 四、Redis 启动方式（两种常用方式）

### 1. Xhell 连接

```bash
# 方式1：指定配置文件启动（推荐，加载自定义配置）
redis-server /usr/local/src/redis-6.2.6/redis.conf

# 验证启动是否成功（查看Redis进程）
ps -ef | grep redis
# 若显示 "redis-server 0.0.0.0:6379" 即启动成功
```
![[Pasted image 20251203191146.png]]

# 2 . Pingpong
```bash
# 进入Redis客户端
redis-cli
# 输入密码认证（替换为你的Redis密码）
127.0.0.1:6379> auth 你的密码
# 验证连接（返回PONG即正常）
127.0.0.1:6379> ping
# 退出客户端
127.0.0.1:6379> exit
```

# 五, redis 状态：重新加载 systemd 配置并启动 Redis

```bash
# 重新加载systemd配置（识别新创建的redis.service）
systemctl daemon-reload
# 启动Redis服务
systemctl start redis.service
# 查看服务状态（显示active(running)即正常）
systemctl status redis.service






# （可选）设置开机自启
systemctl enable redis.service
```

## 五、关键配置：开放 6379 端口（远程连接必备）

服务器防火墙默认拦截 6379 端口，需手动开放（以 CentOS firewalld 为例）：

```bash
# 临时开放6379端口（立即生效，重启防火墙后失效）
firewall-cmd --add-port=6379/tcp
# 永久开放6379端口（长期使用，需重新加载防火墙）
firewall-cmd --add-port=6379/tcp --permanent
# 重新加载防火墙配置（使永久规则生效）
firewall-cmd --reload
# 验证端口是否开放成功
firewall-cmd --query-port=6379/tcp  # 输出yes即成功
```

## 六、连接验证（本地 + 远程）

### 1. 本地连接验证（服务器端测试）

```bash
# 进入Redis客户端
redis-cli
# 输入密码认证（替换为你的Redis密码）
127.0.0.1:6379> auth 你的密码
# 验证连接（返回PONG即正常）
127.0.0.1:6379> ping
# 退出客户端
127.0.0.1:6379> exit
```

### 2. 远程连接验证（如 IDEA/Jedis 连接）

1. 本地机器打开 CMD，测试端口连通性：

```cmd
telnet 192.168.100.128 6379  # 替换为服务器IP
```

- 显示空白界面：端口连通正常；
- 提示 “无法连接”：检查防火墙 / Redis 配置（bind/protected-mode）。

2. IDEA 代码连接（修正端口 + 密码后）：


```java
@BeforeEach
void setUp() {
    jedis = new Jedis("192.168.100.128", 6379);  // 端口6379（Redis默认，非22）
    jedis.auth("你的密码");  // 与redis.conf中requirepass一致
    jedis.select(0);  // 选择0号数据库（默认）
}
```

## 七、常用运维命令（问题排查 / 服务管理）

### 1. 停止 Redis 服务

```bash
# 方式1：通过redis-cli停止（推荐，优雅关闭）
redis-cli -h 127.0.0.1 -p 6379 auth 你的密码 shutdown

# 方式2：强制杀死进程（仅服务无法正常停止时使用）
ps -ef | grep redis | grep -v grep  # 查找Redis进程ID（第二列是PID）
kill -9 进程ID  # 替换为实际PID，如kill -9 17263
```

### 2. 重启 Redis 服务

```bash
# 系统服务方式重启（若已配置redis.service）
systemctl restart redis.service

# 直接启动方式重启（指定配置文件）
redis-server /usr/local/src/redis-6.2.6/redis.conf
```

### 3. 查看 Redis 运行状态

```bash
# 系统服务方式查看
systemctl status redis.service

# 查看端口监听情况（确认6379端口是否被Redis占用）
netstat -tulpn | grep 6379  # 需安装net-tools（yum install -y net-tools）
# 或无需安装工具：ss -tulpn | grep 6379
```

## 八、常见问题说明

1. 为什么要修改配置文件？
    
    - 默认配置仅允许本地访问（bind 127.0.0.1），远程无法连接；
    - 默认前台运行（daemonize no），关闭终端即停止；
    - 无密码（requirepass 注释），存在安全风险。
2. 启动失败排查顺序：
    
    - 检查配置文件路径是否正确（ExecStart 中 redis.conf 路径）；
    - 检查端口是否被占用（netstat -tulpn | grep 6379）；
    - 检查防火墙是否开放 6379 端口；
    - 查看日志（redis.conf 中指定 logfile 路径，或通过 journalctl -xeu redis.service 查看服务日志）。

编辑


