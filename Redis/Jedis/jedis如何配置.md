
## 一、Maven 核心依赖（pom. Xml）


```xml
<!-- Redis 核心依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<!-- 连接池依赖 -->
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-pool2</artifactId>
</dependency>
```

## 二、Yaml 核心配置（application. Yml）
k
```yaml
spring:
  redis:
    host: localhost  # 服务器地址
    port: 6379       # 端口
    password: ""     # 密码（无则留空）
    database: 0      # 操作的库（0-15）
    timeout: 3000    # 连接超时（3秒）
    lettuce:
      pool:
        max-active: 16  # 最大连接数
        max-idle: 8     # 最大空闲连接
        min-idle: 4     # 最小空闲连接