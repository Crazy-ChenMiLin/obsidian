# 库管理
##### （1）创建库（4 种方式）
2. 安全创建（推荐）CREATE DATABASE IF NOT EXISTS 库名；避免库已存在时报错
3. 同时指定字符集和排序规则
	1. CREATE DATABASE 库名 CHARACTER SET 字符集 COLLATE 排序规则；如支持多语言 + 大小写敏感：utf8mb4 + utf8mb4_0900_as_cs

##### （2）查看与使用库
查看所有库：`SHOW DATABASES;`
查看当前使用库：`SELECT DATABASE();`
切换 / 选中库：`USE 库名;`（操作表前必须执行）


查看指定库的表：`SHOW TABLES FROM 库名;`

##### （3）修改库
仅支持修改==字符集和排序规则，语法==
```
ALTER DATABASE 库名 CHARACTER SET 字符集;
ALTER DATABASE 库名 COLLATE 排序规则;
```
不支持直接改名（可视化工具实质是 “建新库→复制表→删旧库”）。

##### （4）删除库

- 安全删除（推荐）：`DROP DATABASE IF EXISTS 库名;`
# 表管理
##### （1）创建表

    ```
    CREATE TABLE [IF NOT EXISTS] 表名 (
        列名 列类型 [列约束] [COMMENT '列注释'],
        列名 列类型 [列约束] [COMMENT '列注释']  -- 列之间用逗号分隔
    ) [表约束] [COMMENT '表注释'];
    ```

##### （4）删除表与清空数据

- 清空表数据（不可逆）：`TRUNCATE TABLE 表名;`（删除所有数据，保留表结构，速度快）

##### （3）修改表

| 操作        | 语法                                           | 说明            |
| --------- | -------------------------------------------- | ------------- |
| 添加列       | ALTER TABLE 表名 ADD 字段名 类型 [FIRST/AFTER 字段名]; | 可指定列位置（默认在最后） |
| 修改列名 + 类型 | ALTER TABLE 表名 CHANGE 原字段名 新字段名 新类型；         | 同时修改列名和类型     |
| 仅修改列类型    | ALTER TABLE 表名 MODIFY 字段名 新类型；               | 保留列名，仅改类型     |
| 删除列       | ALTER TABLE 表名 DROP 字段名；                     | 不可逆，谨慎操作      |
| 修改表名      | ALTER TABLE 表名 RENAME [TO] 新表名；              | 直接修改表名        |


# 数据 CURD

## 先创建表结构：

```
CREATE DATABASE IF NOT EXISTS dml_d1;
USE dml_d1;
CREATE TABLE students ( 
      stu_id INT COMMENT '学号', 
      stu_name VARCHAR(100) COMMENT '姓名', 
      stu_age TINYINT UNSIGNED COMMENT '年龄', 
      stu_birthday DATE COMMENT '生日', 
      stu_height DECIMAL(4, 1) DEFAULT 200 COMMENT '身高，保留一位小数'
);
```


### 增加

| 练习场景                          | 实现语法                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1. 插入所有字段数据                   | `INSERT INTO students VALUES (1, '张三', 20, '2004-01-01', 175.0);`                                             |
| 2. 插入指定字段（学号、姓名、年龄），其他列用默认值   | `INSERT INTO students(stu_id, stu_name, stu_age) VALUES (2, '李四', 19);`                                       |
| 3. 批量插入两名学生的所有字段数据            | `INSERT INTO students VALUES (3, '王五', 21, '2003-05-05', 180.5), (4, '赵六', 22, '2002-08-08', 172.3);`         |
| 4. 插入指定字段（学号、姓名、年龄），其他列为 NULL | `INSERT INTO students(stu_id, stu_name, stu_age, stu_birthday, stu_height) VALUES (5, '孙七', 20, NULL, NULL);` |

### 删除

| 语法场景          | 语法格式                              | 关键说明                                                                                             |
| ------------- | --------------------------------- | ------------------------------------------------------------------------------------------------ |
| 场景 1：全表删除     | `DELETE FROM 表名;`                 | 1. 无 WHERE 条件，删除表中**所有行**数据；<br><br>2. 保留表结构，仅清空数据                                               |
| 场景 2：条件删除（推荐） | `DELETE FROM 表名 WHERE condition;` | 1. 仅删除满足`condition`的行；<br><br>2. `condition`为逻辑表达式（如`stu_age>23`、`stu_height>200 AND stu_id>10`） |

### 修改
| 语法场景          | 语法格式                                                         | 关键说明                                                                         |
| ------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| 场景 1：全表更新     | `UPDATE 表名 SET 列名1=value1, 列名2=value2, ...;`                 | 1. 无 WHERE 条件，更新表中**所有行**数据；<br><br>2. 谨慎使用，易误改全表数据                          |
| 场景 2：条件更新（推荐） | `UPDATE 表名 SET 列名1=value1, 列名2=value2, ... WHERE condition;` | 1. 仅更新满足`condition`的行；<br><br>2. `condition`为逻辑表达式（如`stu_id=8`、`stu_age<20`） |
|               |                                                              |                                                                              |
![[2-CRUD 2026-05-17 15.02.10.excalidraw]]
## 查询
#### 简单查询

|场景|语法格式|关键说明|
|---|---|---|
|场景 1：非表查询|`SELECT 常量/表达式/函数;`|类似控制台输出，如`SELECT 100+50;`、`SELECT VERSION();`|
|场景 2：指定表查询|`SELECT 列名1, 列名2... FROM 表名;` 或 `SELECT 表名.* FROM 表名;`|① `*` 代表查询所有列；② 列之间用逗号分隔|
|场景 3：查询列起别名|`SELECT 列名 AS 别名 FROM 表名;`（AS 可省略）|① 别名区分大小写需加双引号（如`"Name"`）；② 简化列名或适配 Java 属性|
|场景 4：去除重复行|`SELECT DISTINCT 列名1[,列名2...] FROM 表名;`|① `DISTINCT` 仅写一次且在最前；② 支持单列或多列去重|
|场景 5：查询常数|`SELECT '常量值' AS 列名, 列名... FROM 表名;`|新增固定常数列，值不随表数据变化|

#### 高级查询
分组查询：
	Select 分组列，聚合函数 from 表名 【where 条件】 GROUP BY 分组列 【HAVING 分组后条件】


排序查询：
	Select 列名 from 表名 【where 条件】 order by 排列序 ASC/DESC，排列序 2 ASC/DECS


分页查询：



### 行转列：
``` mysql
create table score(
name varchar (10),
subject varchar(10),
score int
);

insert into score values
('张三','语文',90),
('张三','数学',95),
('张三','英语',88),
('李四','语文',85),
('李四','数学',92),
('李四','英语',92);
```



``` mysql
select
	name,
	max(case when subject = "语文" then score end ) as 语文,
	max(case when subjetc = "数学" then score end ) as 数学,
	max(case when subject = "英语" then score end ） as 英语
from score
group by name;

```





# 提问
#### 问题 1：DDL 的核心作用是什么？与 DML、DQL 的核心区别是什么？

**答案**：DDL 的核心作用是**定义和管理数据库结构**（如库、表、索引等 “容器”），仅操作结构不涉及具体数据。与其他 SQL 分类的区别：① DML（数据操纵语言）负责表中数据的增删改；② DQL（数据查询语言）负责表中数据的查询；③ DDL 聚焦 “容器搭建”，DML/DQL 聚焦 “数据操作”，三者分工明确，是数据库操作的基础流程（DDL 建容器→DML 存数据→DQL 查数据）。

#### 问题 2：创建库和创建表的核心区别是什么？创建时需重点关注哪些参数？

**答案**：核心区别在于操作对象和必填参数：① 创建库是创建 “文件夹”，必填参数仅 “库名”，可选参数为字符集 / 排序规则；② 创建表是创建 “文件夹内的表格”，必填参数为 “表名、列名、列类型”，可选参数包括列约束、注释、表配置（如存储引擎）。创建时需重点关注：库和表的字符集（推荐`utf8mb4`，支持多语言和表情）、`IF NOT EXISTS`安全语法（避免重复创建报错）、列类型与数据匹配（如价格用 DECIMAL，姓名用 VARCHAR）。
#### 问题 3：WHERE 和 HAVING 的区别是什么？实际使用中如何选择？

**答案**：两者的核心区别的是过滤时机和支持条件：① 过滤时机：`WHERE`在分组前过滤行数据，`HAVING`在分组后过滤分组结果；② 支持条件：`WHERE`不支持聚合函数，`HAVING`支持聚合函数；③ 依赖关系：`HAVING`不能单独使用，必须配合`GROUP BY`，`WHERE`可独立使用。实际选择：需过滤行数据时用`WHERE`（如 “工资> 5000”），需过滤分组统计结果时用`HAVING`（如 “平均工资> 8000”）。

