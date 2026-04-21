前言：
我觉得还是比较难的，但是里面的一些理念还是听过，比如：指针，快照


B 站讲 mvcc 比较好的视频：
	https://www.bilibili.com/video/BV1B9kqYSEMe?t=527.2


# 一. 总结
![[MySQL 事务、隔离级别与锁机制 2026-03-30 15.23.27.excalidraw]]
### 二、MVCC 的核心原理：如何实现“多版本”与“可见性”？

MVCC 的实现依赖 InnoDB 的三大核心组件，以及一套严格的“可见性判断规则”，这也是理解 MVCC 的关键。

#### 2.1 支撑 MVCC 的 3 个核心组件

InnoDB 通过以下三个组件，为 MVCC 给出“版本存储”和“版本追溯”的基础，这些组件在之前的 InnoDB 架构文章中已有提及，此处需结合 MVCC 重新梳理：

##### 1. 数据行的隐藏列

InnoDB 会为每一条数据记录自动添加 3 个隐藏列，用于记录版本信息：

- **DB_TRX_ID（事务 ID）**：记录最后一次修改该素材的事务 ID（每个事务启动时，InnoDB 会分配一个全局唯一的递增事务 ID）；
- **DB_ROLL_PTR（回滚指针）**：指向该信息的“上一个历史版本”在 Undo Log 中的存储地址，通过该指针，可串联起该数据的所有历史版本，形成一条“版本链”；
- **DB_ROW_ID（行 ID）**：若表没有显式定义主键，InnoDB 会用这个隐藏列作为默认主键，与 MVCC 直接关联不大，但确保每行资料唯一。

举个例子：假设表 `user` 有一条初始数据 `(id=1, name="张三", age=20)`，其隐藏列初始状态如下：

|id|name|age|DB_TRX_ID|DB_ROLL_PTR|
|---|---|---|---|---|
|1|张三|20|0|NULL|

##### 2. Undo Log（回滚日志）

Undo Log 不仅是事务回滚的依据，也是 MVCC 存储“历史版本数据”的载体。当事务修改材料时，InnoDB 会先将数据的“旧版本”写入 Undo Log，再修改当前数据并更新隐藏列：

- 若事务执行 `ROLLBACK`，可通过 Undo Log 恢复旧版本；
- 若其他事务需要读取历史版本，可通过 `DB_ROLL_PTR` 从 Undo Log 中获取对应版本数据。

例如：事务 1（TRX_ID=100）执行 `UPDATE user SET age=21 WHERE id=1`，InnoDB 会：

1. 将数据的旧版本 `(id=1, name="张三", age=20, DB_TRX_ID=0)` 写入 Undo Log；
2. 修改当前数据的 `age` 为 21，更新 `DB_TRX_ID=100`，`DB_ROLL_PTR` 指向 Undo Log 中旧版本的地址；  
    此时素材的版本链如下：

- 当前版本：`(age=21, DB_TRX_ID=100, DB_ROLL_PTR→Undo Log旧版本)`
- Undo Log 中的历史版本：`(age=20, DB_TRX_ID=0, DB_ROLL_PTR=NULL)`

##### 3. Read View（读视图）

Read View 是事务读取数据时的“可见性判断依据”，它本质是一个“事务 ID 集合”，包含以下 4 个核心参数：

- **m_low_limit_id**：当前系统中“尚未分配的最小事务 ID”（即下一个要启动的事务 ID）；
- **m_up_limit_id**：当前 Read View 中“已分配的最大事务 ID”；
- **m_creator_trx_id**：创建该 Read View 的事务 ID（即当前读取数据的事务 ID）；
- **m_ids**：当前环境中“正在活跃的事务 ID 列表”（即已启动但未提交的事务 ID）。

当事务读取数据时，会通过 Read View 判断数据版本的“可见性”—— 只有满足规则的材料版本，才会被当前事务读取。
### 3.4 Read View 生成时机

- **READ COMMITTED**：每次执行 SELECT 语句时，都会生成一个新的 Read View。因此，每次读取可能看到不同的已提交版本。
- **REPEATABLE READ**：事务启动时（第一次 SELECT 时）生成一个 Read View，整个事务期间复用该视图。因此，事务内多次读取结果一致（不可重复读被消除）。

### 3.5 快照读与当前读

- **快照读**：普通的 `SELECT` 语句，不加锁，通过 MVCC 读取历史版本，避免加锁开销。在 RC 和 RR 下均为快照读。
- **当前读**：读取最新已提交数据，并可能加锁。包括：
    - `SELECT ... FOR UPDATE`（加写锁）
    - `SELECT ... LOCK IN SHARE MODE`（加读锁）
    - `INSERT`、`UPDATE`、`DELETE` 语句（这些操作会先执行当前读，再修改数据）

幻读问题正是由于快照读与当前读结果不一致导致的。在 RR 级别，InnoDB 使用**间隙锁**（Gap Lock）来防止其他事务在当前读范围内插入新行，从而避免幻读。