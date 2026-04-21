# Java NIO 全知识点终极整理
**全覆盖：BIO/NIO 底层原理 + 三大组件 + Selector + 事件 + Buffer 核心 + 代码规范**

## 一、IO 模型底层核心原理（操作系统级）
1. **BIO 阻塞本质**
JVM 调用 OS 的 `read/write/accept`，**无数据时线程被 OS 挂起**，占线程不占 CPU；**1 连接=1 线程**，高并发线程爆炸。
2. **NIO 多路复用本质**
Selector 调用 OS 原生 API（Linux epoll），**单线程批量监控所有 Channel**；无事件休眠，有事件才处理，线程利用率拉满。
3. **NIO 模型定义**
Java NIO = **同步非阻塞 IO**（非异步，异步是 AIO）；IO 操作无数据**直接返回**，不挂起线程。

---

## 二、NIO 三大核心组件（基石）
### 1. Channel（通道）
- 双向数据传输，**必须配合 Buffer 使用**
- 核心实现：ServerSocketChannel (服务端)、SocketChannel (客户端)

### 2. Buffer（缓冲区）【最新补充】
- 本质：固定大小内存数组，**NIO 数据唯一中转站**，最常用 `ByteBuffer`
1）四大核心属性（必考）
- `capacity`：**容量**，创建后固定不可变
- `position`：下一个读写的索引位置
- `limit`：读写边界，超过不可操作
	- 写 10 字节后`flip()`：`position=0，limit=10
- `mark`：标记位，用于回溯数据
2）三大核心方法（读写切换）
- `flip()`：**写→读切换**（position=0，limit=原 position）C
- `clear()`：**清空重置**（回归写模式，position=0，limit=capacity）
- `rewind()`：重读数据（仅 position=0，不修改 limit）

### 3. Selector（选择器/多路复用器）
- NIO 灵魂：**单线程管理海量连接**
- 核心方法：
  - `select()`：阻塞等待就绪事件，**OS 挂起线程不耗 CPU**，有事件才唤醒
  - `selectedKeys()`：获取**仅就绪**的事件（待处理）
  - `registeredKeys()`：获取**所有已注册**的 Channel（全量）

---

## 三、SelectionKey 四大标准事件（无 OP_EXIT）
1. `OP_ACCEPT`：**服务端专属**，监听到新客户端连接
2. `OP_READ`：内核有数据，**可读客户端数据**
3. `OP_WRITE`：内核缓冲区空闲，**可写数据**
4. `OP_CONNECT`：**客户端专属**，连接服务端成功

---

## 四、核心 API 关键规则 & 易错坑点（错题合集）
1. **channel.Read (buffer) 返回值**
   - 正数：读到字节数；0：暂无数据；**-1：客户端正常断开连接**
2. **selectedKeys 强制规范**
   处理完事件**必须手动移除 key**，否则**重复处理、死循环**
3. **数据流向（终身口诀）**
   - 读：客户端 → Channel → Buffer
   - 写：Buffer → Channel → 客户端

---

## 五、原生 NIO 服务端标准 5 步流程（你写的核心代码）
```java
// 1. 创建多路复用器
Selector selector = Selector.open();
// 2. 注册Channel+监听事件
serverChannel.register(selector, SelectionKey.OP_ACCEPT);
// 3. 阻塞等待就绪事件
selector.select();
// 4. 获取就绪事件集合
Set<SelectionKey> readyKeys = selector.selectedKeys();
// 5. 遍历处理 + Channel+Buffer读写
for (SelectionKey key : readyKeys) {
    if (key.isReadable()) {
        SocketChannel channel = (SocketChannel) key.channel();
        ByteBuffer buffer = ByteBuffer.allocate(1024);
        channel.read(buffer);
    }
    readyKeys.remove(key); // 必须移除！
}
```

---

## 六、核心对比（面试秒答）
| 特性   | BIO       | NIO                     |
| :--- | :-------- | :---------------------- |
| 阻塞性  | 同步阻塞      | 同步非阻塞                   |
| 线程模型 | 1 连接 1 线程 | 1 线程管理海量连接              |
| 核心依赖 | Stream    | Channel+Buffer+Selector |
| 适用场景 | 低并发、短连接   | 高并发、长连接（Dubbo/Netty）    |