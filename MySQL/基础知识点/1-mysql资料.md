- [DDL:操作数据库、表](https://cloud.tencent.com/developer?from_column=20421&from=20421)
    - [操作数据库：CRUD](https://cloud.tencent.com/developer?from_column=20421&from=20421)
    - [使用数据库](https://cloud.tencent.com/developer?from_column=20421&from=20421)
    - [操作表](https://cloud.tencent.com/developer?from_column=20421&from=20421)CRUD](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [DML：增删改表中数据](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [DQL：查询表中的记录](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [DCL：管理用户，授权](https://cloud.tencent.com/developer?from_column=20421&from=20421)
    - [管理用户](https://cloud.tencent.com/developer?from_column=20421&from=20421)
    - [添加用户](https://cloud.tencent.com/developer?from_column=20421&from=20421)
    - [删除用户](https://cloud.tencent.com/developer?from_column=20421&from=20421)
    - [修改用户密码](https://cloud.tencent.com/developer?from_column=20421&from=20421)
    - [查询用户](https://cloud.tencent.com/developer?from_column=20421&from=20421)
    - [权限管理](https://cloud.tencent.com/developer?from_column=20421&from=20421)
    - [查询权限](https://cloud.tencent.com/developer?from_column=20421&from=20421)
    - [授予权限](https://cloud.tencent.com/developer?from_column=20421&from=20421)
    - [撤销权限](https://cloud.tencent.com/developer?from_column=20421&from=20421)
- [TCL：事务控制](https://cloud.tencent.com/developer?from_column=20421&from=20421)
    - [概念](https://cloud.tencent.com/developer?from_column=20421&from=20421)
    - [操作](https://cloud.tencent.com/developer?from_column=20421&from=20421)
## 一、数据库概述
- 核心概念：长期存储、有组织、可共享、统一管理的数据集
- 分类：关系型数据库（表结构、ACID 事务）、非关系型数据库（灵活模型、高性能）
- 存储结构：库→表→行→列（E-R 模型）
- 选择原则：混合使用，主体数据用关系型，缓存/高并发数据用非关系型

#### 问题 1：关系型数据库与非关系型数据库的核心区别是什么？各自适用哪些场景？

![[Pasted image 20260323170340.png]]

#### 问题 2：MySQL 安装时的关键配置有哪些？为什么这些配置很重要？

**答案**：关键配置有两项：① 编码格式设置为`utf8`；② 存储引擎选择`INNODB`。重要性：编码设置为 utf8 可避免中文数据存储时出现乱码，确保数据展示正常；INNODB 存储引擎支持事务（保证数据操作的原子性、一致性，如转账失败时资金不丢失）和表关联查询，是企业开发的必需配置，而其他存储引擎（如 MyISAM）不支持事务，无法满足核心业务需求。

#### 问题 3：SQL 的五大分类分别是什么？各自的核心作用是什么？学习优先级如何安排？

**答案**：SQL 五大分类为 DDL（数据定义语言）、DML（数据操纵语言）、DQL（数据查询语言）、TCL（事务控制语言）、DCL（数据控制语言）。核心作用：① DDL 负责创建 / 修改 / 删除库、表等存储容器；② DML 负责表中数据的增、删、改；③ DQL 负责多条件查询表中数据（开发最常用）；④ TCL 负责事务的启动、提交与回滚；⑤ DCL 负责账号创建和权限控制。
	学习优先级：DDL→DML→DQL（基础核心，必须掌握）→TCL→DCL（扩展拔高，按需学习）。


## 二、MySQL 安装
- 版本选择：推荐 8.0+（5.7 扩展支持 2023 年 10 月终止）
- 下载地址：https://dev.mysql.com/downloads/mysql/
- 关键配置：编码 utf 8、存储引擎 INNODB
- 系统适配：Windows 10 专业版、macOS Ventura 等
- 常见问题：密码遗忘、中文乱码（参考专用解决文档）
## 三、SQL 概述
- 定义：结构化查询语言，支持标准 SQL 与 MySQL 方言
- 操作方式：CLI（命令行）、GUI（可视化工具）
- 分类：DDL（数据定义）、DML（数据操纵）、DQL（数据查询）、TCL（事务控制）、DCL（数据控制）
- 基础命令：连接（mysql -u 用户名 -p 密码）、查版本（select version ()）、退出（exit）、注释规则
## 四、可视化工具
- 常用工具：SQLyog（Windows 优先，中文界面）、Navicat（多系统支持，14 天试用）、MySQL Workbench（官方免费，全英界面）
- 安装连接：Windows 版 SQLyog（位置：资料/软件/window/）、Mac 版 Navicat
- 核心优势：解决命令行无提示、不便粘贴、无法可视化等问题