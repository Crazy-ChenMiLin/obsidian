---
title: JDBC 概述与实践（详解）
tags: [JDBC, 数据库, Java]
aliases: ["JDBC 入门", "数据库 连接"]
---

## 一、JDBC 是什么

JDBC（Java Database Connectivity）是 Java 访问数据库的标准 API，定义在 java.sql 包中。它为不同数据库厂商提供统一的访问接口，数据库供应商通过驱动实现具体连接逻辑。

## 二、JDBC 的基本步骤

典型流程：

1. 注册驱动（早期需要 Class.forName，但现代驱动通过 SPI 自动注册）
2. 获取 Connection（建立与数据库的会话）
3. 创建 Statement / PreparedStatement
4. 执行 SQL（executeQuery / executeUpdate）
5. 处理 ResultSet
6. 关闭资源（ResultSet -> Statement -> Connection）

示例代码：

```java
String sql = "SELECT id, name FROM employee WHERE id = ?";
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setInt(1, id);
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            // 读取字段 rs.getInt("id")...
        }
    }
}
```

注意：使用连接池（HikariCP、Druid 等）能显著提升性能并避免连接泄漏。

## 三、性能与安全建议

- 使用 PreparedStatement 防止 SQL 注入并复用预编译计划
- 批量写入使用 addBatch()/executeBatch() 减少网络往返
- 使用合理的事务边界，避免长事务导致锁竞争

## 四、为什么引入 MyBatis / ORM

JDBC 的代码通常较为冗长，易出错。MyBatis 在 JDBC 之上提供映射层，简化 SQL 管理和结果映射；ORM（如 Hibernate）提供对象关系映射，进一步减少样板代码，但也需权衡性能和可预测性。

## 五、扩展（可选）

我可以把本章扩展为：

- PreparedStatement 与 Statement 对比示例
- HikariCP 配置示例
- Spring Boot + JDBC / MyBatis 可运行样例
