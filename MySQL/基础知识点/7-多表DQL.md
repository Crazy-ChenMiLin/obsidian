![[多表DQL 2026-03-25 10.34.46.excalidraw]]

## 一：去重总结
| 特性     | DISTINCT    | GROUP BY    | UNION       |
| ------ | ----------- | ----------- | ----------- |
| 去重范围   | 单查询结果内部     | 单查询结果内部     | 跨多个查询结果     |
| 主要目的   | 简单去重        | 分组统计        | 合并查询结果      |
| 聚合支持   | ❌           | ✅           | ❌           |
| 典型场景   | 获取唯一值列表     | 分组统计分析      | 整合多表数据      |
| NULL处理 | 视为相同值，只保留一个 | 视为相同值，只保留一个 | 视为相同值，只保留一个 |
### 1. 原始数据表（employees）

|id|name|city|department|
|---|---|---|---|
|1|Alice|New York|HR|
|2|Bob|London|IT|
|3|Charlie|New York|HR|
|4|David|Paris|Sales|
|5|Eve|London|IT|
|6|Frank|New York|Sales|
|7|Grace|London|IT|
### 2. DISTINCT 去重示例

```
1SELECT DISTINCT city, department FROM employees;
```

| city     | department |
| -------- | ---------- |
| New York | HR         |
| London   | IT         |
| Paris    | Sales      |
| New York | Sales      |

- **去重机制**：去除**完全重复**的行，只保留唯一组合
- **特点**：直接对结果集进行全字段比对，去除重复记录

### 3. GROUP BY 去重示例


```
SELECT city, department FROM employees GROUP BY city, department;
```

**结果表**（与 DISTINCT 相同）：

|city|department|
|---|---|
|New York|HR|
|London|IT|
|Paris|Sales|
|New York|Sales|

- **去重机制**：通过**分组**实现去重，每组只返回一条记录
- **特点**：可结合聚合函数使用，如 `COUNT(*)` 统计每组人数

**扩展示例**（带聚合）：

```
1SELECT city, department, COUNT(*) as employee_count 
2FROM employees 
3GROUP BY city, department;
```

| city     | department | employee_count |
| -------- | ---------- | -------------- |
| New York | HR         | 2              |
| London   | IT         | 3              |
| Paris    | Sales      | 1              |
| New York | Sales      | 1              |

### 4. UNION 去重示例

```
1SELECT city FROM employees WHERE department = 'HR'
2UNION
3SELECT city FROM employees WHERE department = 'IT';
```

| city     |
| -------- |
| New York |
| London   |
- **去重机制**：合并**多个查询结果**并去除跨查询的重复记录
- **特点**：自动去除不同查询结果之间的重复记录

**对比示例**（UNION ALL 不去重）：

```
1SELECT city FROM employees WHERE department = 'HR'
2UNION ALL
3SELECT city FROM employees WHERE department = 'IT';
```

| city     |
| -------- |
| New York |
| New York |
| London   |
| London   |
| London   |

## 二. 垂直合并

union 和union all

## 三. 水平合并

inner join

left join
