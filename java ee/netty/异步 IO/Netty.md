# 一.Netty

**Netty 是基于 NIO 封装的高性能网络框架**，解决了原生 NIO 的所有坑，是 Java 网络编程的事实标准。Tomcat、Dubbo、RocketMQ、Elasticsearch 等所有主流框架都用 Netty。

# 二.为什么有了 nio，还需要引入Netty？
原生 NIO 有**6 大致命痛点**，全是 Netty 帮我们解决的：

NIO
1. **API 极度繁琐**：要手动写 `flip()`、手动移除 `SelectionKey`、手动管理 Buffer
2. **Selector 空轮询 BUG**：Linux 下会导致 CPU 100%，JDK 至今未彻底修复
3. **粘包 / 半包无解**：原生 NIO 不处理，需要自己手写分包逻辑（新手噩梦）
4. **异常处理繁琐**：客户端断连、心跳、异常都要手动判断
5. **线程模型难写**：主从 Reactor、多线程管理需要自己造轮子
6. **无通用编解码**：需要手动拼接字节数组，开发效率极低
Netty
- 修复了原生 NIO 的空轮询 bug
- 提供了丰富的编解码器（解决粘包拆包、HTTP、WebSocket 等）
- 优雅的主从 Reactor 线程模型
- 零拷贝技术，性能极高
- 简单易用的 API，屏蔽了底层复杂细节
---
# 三、Netty 组件 ↔ 原生 NIO 组件

![[Pasted image 20260416213155.png]]

1. **启动器**（Bootstrap）：帮你一键启动，不用手写 NIO 复杂流程
2. **管道链**（Pipeline）：串起所有业务逻辑
3. **处理器**（Handler）：写具体读 / 写业务
4. **初始化器**（ChannelInitializer）：把 Handler 装进管道




# 四.模板：

![[Netty 2026-04-17 13.19.55.excalidraw]]

## Server模板类似于反射的 hander 处理：

```java
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;

/**
 * Netty 服务端标准模板（主从Reactor模型，Dubbo默认底层）
 */
public class NettyServer {
    public static void main(String[] args) throws InterruptedException {
        // 1. 创建主从线程组（核心！Boss+Worker）
        // BossGroup：仅接收客户端连接 OP_ACCEPT
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        // WorkerGroup：处理读写IO事件 OP_READ/OP_WRITE
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            // 2. 服务端启动引导类
            ServerBootstrap bootstrap = new ServerBootstrap();

            // 3. 配置核心参数
            bootstrap.group(bossGroup, workerGroup) // 绑定主从线程组
                     .channel(NioServerSocketChannel.class) // 指定NIO通道类型
                     .option(ChannelOption.SO_BACKLOG, 128) // 连接队列大小
                     .childOption(ChannelOption.SO_KEEPALIVE, true) // 心跳保活
                     // 4. 初始化管道，添加自定义处理器
                     .childHandler(new ChannelInitializer<SocketChannel>() {
                         @Override
                         protected void initChannel(SocketChannel ch) {
                             // 向Pipeline添加自定义Handler（业务逻辑）
                             ch.pipeline().addLast(new MyServerHandler());
                         }
                     });

            // 5. 绑定端口，同步启动
            ChannelFuture channelFuture = bootstrap.bind(8888).sync();
            System.out.println("Netty服务端启动成功，端口：8888");

            // 6. 阻塞等待关闭通道
            channelFuture.channel().closeFuture().sync();
        } finally {
            // 7. 优雅关闭线程组
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
}
```


## 启动器 → 初始化器 → pipeline (). AddLast (Handler)
```java
// ========== ① 启动器（Bootstrap）：Netty多出来的「总开关」 ==========
启动器.group(老板, 员工)       // 启动器绑定线程组（老板接连接，员工读写）
       .channel(NioServerSocketChannel.class) // 启动器指定服务端通道（固定死）

// ========== ② 初始化器（ChannelInitializer）：Netty多出来的「装Handler工具」 ==========
       .childHandler(new ChannelInitializer() { // 【初始化器】专门用来装Handler

           // 初始化器的固定方法：往管道里塞东西
           protected void initChannel(SocketChannel ch) {

               // ========== ③ 管道链（Pipeline）：Netty多出来的「业务链条」 ==========
               // ========== ④ 处理器（Handler）：Netty多出来的「具体业务」 ==========
               ch.pipeline().addLast(new MyHandler());
               //   管道链        把处理器(业务) 串到链条最后
           }
       });
```


``` java
// 客户端【只有1个线程组】：不用老板，只需要员工（只读写，不接连接）
EventLoopGroup 员工 = new NioEventLoopGroup();

try {
    // 客户端启动器：没有Server！
    Bootstrap 启动器 = new Bootstrap();

    启动器.group(员工) // 只绑定员工，没有老板
           .channel(NioSocketChannel.class) // 客户端通道（固定）
           .handler(new ChannelInitializer() { // 没有child，直接handler
               protected void initChannel(SocketChannel ch) {
                   ch.pipeline().addLast(new MyClientHandler());
               }
           });
}
```

## 为什么服务端多个 child，客户端没有。
**服务端开店面 → 接无数客户 (child) → 用 .childHandler ()**

**客户端是客人 → 只自己一个 → 用 .handler () 无 child**