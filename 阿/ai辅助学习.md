第 N 轮【大厂必考：原理 + 核心双维度】
## 先学【大厂必背原理】
1. 核心原理 1
2. 核心原理 2
3. 核心原理 3

---

## 本轮考题（核心 + 原理，大厂面试原题难度）
### 判断题（√/×）
1. 判断题题干 1
2. 判断题题干 2
3. 判断题题干 3

### 单选题
1. 单选题题干 1（）
A. 选项 A
B. 选项 B
C. 选项 C
D. 选项 D

2. 单选题题干 2（）
A. 选项 A
B. 选项 B
C. 选项 C
D. 选项 D

答题格式：√× B B


---

## 二、分场景高频标准化模板（按大厂出题频率排序）
### 场景 1：Netty 服务端启动类补全模板（出题频率★★★★★）
校招必出、社招高频，核心考察**Reactor 线程模型、核心组件生命周期、资源优雅释放**
#### 基础版（校招/初级岗，考察核心用法）
```markdown
### 代码补全题
#### 题目场景
补全代码，实现一个可正常启动、关闭的Netty基础服务端，使用主从Reactor多线程模型。
#### 补全要求
补全代码中【★ 补全位X】的核心代码，保证服务端可正常运行，资源可正确释放。
#### 待补全代码
```java
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;

public class NettyBaseServer {
    private final int port;

    public NettyBaseServer(int port) {
        this.port = port;
    }

    public void run() throws InterruptedException {
        // 1. 创建主从Reactor线程组
        EventLoopGroup bossGroup = 【★ 补全位1：创建Boss线程组，负责接收客户端连接】;
        EventLoopGroup workerGroup = 【★ 补全位2：创建Worker线程组，负责处理IO读写】;
        try {
            // 2. 创建服务端启动辅助类
            ServerBootstrap bootstrap = new ServerBootstrap();
            // 3. 配置启动核心参数
            bootstrap.group(【★ 补全位3：绑定主从线程组】)
                     // 4. 指定服务端通道实现类
                     .channel(【★ 补全位4：指定NIO模式的服务端通道类】)
                     // 5. 配置子通道的处理器初始化逻辑
                     .childHandler(new ChannelInitializer<SocketChannel>() {
                         @Override
                         protected void initChannel(SocketChannel ch) throws Exception {
                             // 给Pipeline添加自定义业务Handler
                             ch.pipeline().addLast(new NettyBaseServerHandler());
                         }
                     });

            // 6. 绑定端口，同步等待启动成功
            ChannelFuture channelFuture = 【★ 补全位5：绑定端口并同步阻塞等待启动完成】;
            // 7. 监听服务端通道关闭事件，阻塞等待
            channelFuture.channel().closeFuture().sync();
        } finally {
            // 8. 优雅关闭线程组，释放所有资源
            【★ 补全位6：编写优雅关闭线程组的代码】;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        new NettyBaseServer(8080).run();
    }
}
