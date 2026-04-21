# Docker 与 MySQL 相关知识点

## 一、Docker 相关指令及要点

1. **查看 Docker 版本**

bash

```bash
docker --version
```

2. **CentOS 安装 Docker**：可以自行安装，CentOS 安装好 Docker 后，Docker 必须启动。

## 二、MySQL 相关操作

### （一）检查 MySQL 状态及关闭

1. **检查 MySQL 状态**：文档未提及具体指令。
2. **关闭 MySQL**：文档未提及具体指令。

### （二）基于 Docker 安装 MySQL

1. **安装指令**

plaintext

```plaintext
docker run -d \
--name mysql-container \
-p 3307:3306 \
-e TZ=Asia/Shanghai \
-e MYSQL_ROOT_PASSWORD=123 \
-v /your/local/path/mysql/data:/var/lib/mysql \ # 本地目录:容器数据目录
mysql:8
```

2. **原理**：基于镜像进行安装。
3. **检查安装是否成功**
    
    在 cmd 中使用指令：

plaintext

```plaintext
mysql -h 192.168.100.128 -P 3307 -uroot -p 123
```

若能进入 MySQL 则安装成功。