![[netty知识点 2026-04-22 11.21.27.excalidraw]]

## 一、Netty 基础定位 & 核心价值

1. 基于**Java NIO 封装**的高性能网络框架，**Dubbo 默认通信底层**
2. 解决原生 NIO 痛点：**空轮询、API 复杂、易错、长度不可变**
3. 目标：高并发、低延迟、高可靠，主流中间件通用网络层

## 二、Netty 核心组件（必背）

### 1. 启动引导类（Bootstrap）

- 服务端：`ServerBootstrap`
- 客户端：`Bootstrap`
- 作用：统一配置线程组、通道、Handler，绑定端口启动

### 2. 线程模型（EventLoop / EventLoopGroup）

- `EventLoop`：**绑定 1 个线程**，负责多个 Channel 的 IO 事件
- `EventLoopGroup`（线程组）：
    
    - **BossGroup**：仅处理 `OP_ACCEPT` 连接事件，不处理读写
    - **WorkerGroup**：处理 `OP_READ/OP_WRITE` 读写事件
    
- Netty 默认：**主从 Reactor 多线程模型**（性能最优）

### 3. 通道（Channel）

- 对原生 NIO Channel 封装，屏蔽底层差异
- `NioServerSocketChannel`：服务端**接收连接**（不读写）
- `NioSocketChannel`：客户端 / 服务端**数据读写**

### 4. 责任链（ChannelPipeline + ChannelHandler）

- `ChannelPipeline`：**责任链模式**，有序串联多个 Handler
- `ChannelHandler`：业务处理器
    
    - `ChannelInboundHandler`：**入站（读数据）**
    - `ChannelOutboundHandler`：**出站（写数据）**
    
- `ChannelInitializer`：辅助类，向 Pipeline 添加 Handler
- `ChannelHandlerContext`：Handler 上下文，**负责事件传递**，获取 Channel/EventLoop

## 三、缓冲区 ByteBuf（对比 NIO ByteBuffer 核心升级）

1. 替代 Java NIO ByteBuffer，**支持动态扩容**
2. **读写指针分离**：`readerIndex` + `writerIndex`，**无需 flip () 切换模式**
3. 内存分类：
    
    - `HeapByteBuf`：堆内存
    - `DirectByteBuf`：直接内存，**少一次拷贝，IO 性能更高**

## 四、Netty 异步核心机制

1. 所有 IO 操作**全异步非阻塞**
2. `ChannelFuture`：承载异步操作结果
3. `Future-Listener`：异步回调机制，**无需阻塞等待**

## 五、Reactor 线程模型（3 种）

1. 单 Reactor 单线程
2. 单 Reactor 多线程
3. **主从 Reactor 多线程（Netty 默认）**：连接与读写分离，性能最高

## 六、高频易错点（错题合集）

1. BossGroup 只处理连接，**不处理读写**
2. 一个 EventLoop**只绑定 1 个线程**
3. `ChannelInboundHandler` 是入站（读），不是出站（写）
4. ByteBuf 读写分离，**不用 flip ()**
5. Netty 是异步非阻塞，**非同步阻塞**