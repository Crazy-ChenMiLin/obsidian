---
title: MyBatis 分页与常用实践（详解）
tags: [MyBatis, 分页, SQL, Java]
aliases: ["Myabatis", "物理分页"]
---

本文着重讲解 MyBatis 中的分页实现（物理分页）、常见写法、性能注意点以及缓存机制（一级/二级缓存）的工作方式与实战建议。

## 一、数据库层面的分页（MySQL）

MySQL 常用分页语法：LIMIT offset, size

- 查询第 1 页（每页 10 条）：

```sql
SELECT id, name, ... FROM employee ORDER BY id LIMIT 0, 10;
```

- 第 2 页：

```sql
SELECT id, name, ... FROM employee ORDER BY id LIMIT 10, 10;
```

注意事项：
- OFFSET（offset 较大）会导致数据库跳过大量行，查询开销随 offset 增大而线性增长，导致性能问题。
- 对于大数据分页，优先考虑基于索引的 keyset pagination（也称为 cursor pagination）：

```sql
SELECT id, name FROM employee WHERE id > :lastId ORDER BY id LIMIT :size;
```

该方式避免了大 offset 的跳过开销，但只能用于按索引顺序访问的场景。

## 二、后端分层（Controller -> Service -> Mapper）

典型流程：

- Controller：接收 page、pageSize，做参数校验与默认值
- Service：计算 offset，调用 Mapper，封装分页结果（rows + total）为 PageBean
- Mapper：执行 SQL（手写或使用分页插件）

示例 Service 层（伪代码）：

```java
public PageBean<Employee> page(int page, int size) {
    int offset = (page - 1) * size;
    List<Employee> rows = empMapper.findPage(offset, size);
    int total = empMapper.countAll();
    return new PageBean<>(page, size, total, rows);
}
```

注意：统计总数（count）和分页查询通常为两条 SQL，复杂过滤条件下 count 查询可能很慢，需要额外优化（缓存、近似计数、异步统计等）。

## 三、MyBatis 映射与 SQL 标签

常用标签：

- <if>：条件拼装
- <where>：智能处理首个 AND/OR
- <foreach>：迭代集合（IN 列表、VALUES 列表）

示例：动态分页查询（Mapper XML）：

```xml
<select id="findPage" resultType="Employee" parameterType="map">
  SELECT id, name, ... FROM employee
  <where>
    <if test="name != null and name != ''">AND name LIKE CONCAT('%', #{name}, '%')</if>
    <if test="status != null">AND status = #{status}</if>
  </where>
  ORDER BY id
  LIMIT #{offset}, #{size}
</select>
```

如果使用注解方式，也可以组合字符串或使用 provider 方法动态构建 SQL。

## 四、分页插件与库

- PageHelper：通过拦截器自动注入 LIMIT，使用简单，返回 PageInfo 等封装
- MyBatis-Plus：在 MyBatis 基础上封装，提供分页、Lambda 查询等便利 API

PageHelper 使用示例：

```java
PageHelper.startPage(page, size);
List<Employee> rows = empMapper.findByCondition(...);
PageInfo<Employee> pageInfo = new PageInfo<>(rows);
```

优点是使用成本低，但注意插件链与自定义 SQL 的兼容性。

## 五、缓存机制（一级缓存与二级缓存）

- 一级缓存（SqlSession 会话级别）：默认开启，范围为同一个 SqlSession。若同一个会话重复查询相同语句与参数会命中缓存。会话关闭或执行更新操作后缓存失效。
- 二级缓存（namespace 级）：需在 mapper.xml 中启用 <cache/> 并配置序列化器，缓存跨 SqlSession 有效，适用于读多写少的场景。

使用注意：

- 分页查询参数不同（offset/size/filters）导致缓存命中率低，二级缓存对分页场景帮助有限。
- 更新操作必须触发相关缓存失效，保证数据一致性。

## 六、性能优化建议

- 大表分页：使用 keyset pagination（基于索引的分页），或基于时间窗口/游标的分批处理。
- 避免 SELECT *，只查询必要字段以减少网络与内存开销。
- 对经常排序/过滤的字段建立合适索引，但避免过多索引影响写性能。
- 若统计 total 很慢，可考虑近似计数或异步统计并缓存结果。

## 七、返回给前端的分页结构建议

标准字段：page, pageSize, total, rows

示例 JSON：

```json
{
  "page": 2,
  "pageSize": 10,
  "total": 12345,
  "rows": [ ... ]
}
```

---

扩展：若需要，我可以把示例改造成 Spring Boot + MyBatis 的可运行示例并放在 examples/ 目录（包含 Docker MySQL 实例）。
