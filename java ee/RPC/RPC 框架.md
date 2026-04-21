# RPC 框架 

## 第一部分：RPC 框架（gRPC & Thrift）
### 一、先搞懂：什么是 RPC？为什么不用 HTTP？
**RPC（Remote Procedure Call，远程过程调用）**：让你像调用**本地方法**一样调用**另一台机器上的方法**，完全屏蔽网络通信的细节。

#### 1. 为什么需要 RPC？
- HTTP 是通用协议，冗余多（HTTP 头占比大）、性能低
- HTTP 需要手动处理序列化、网络连接、异常重试等
- RPC 专门为服务间调用设计，性能高、开发效率高、功能丰富（负载均衡、熔断、限流）

#### 2. RPC vs HTTP 核心对比
| 特性 | RPC（gRPC/Thrift） | HTTP/1.1 | HTTP/2 |
|------|---------------------|----------|--------|
| 传输协议 | HTTP/2 / TCP | HTTP/1.1 | HTTP/2 |
| 序列化 | 二进制（Protobuf/Thrift） | JSON/XML | 同左 |
| 性能 | 极高（比 HTTP/1.1 快 5-10 倍） | 低 | 中高 |
| 开发体验 | 自动生成代码，类型安全 | 手动写接口，无类型检查 | 同左 |
| 适用场景 | 内部服务间调用 | 对外提供 API | 对外高性能 API |

#### 3. RPC 通用工作流程（必背）
所有 RPC 框架的核心流程都是一样的：
1. 客户端调用本地存根（Stub）方法
2. 存根将参数**序列化**为二进制数据
3. 客户端通过网络将数据发送给服务端
4. 服务端存根接收数据并**反序列化**
5. 服务端调用实际的业务方法
6. 服务端将返回值序列化后发回客户端
7. 客户端存根反序列化返回值，交给调用方

### 二、主流 RPC 框架对比：gRPC vs Thrift
这两个是目前最主流的跨语言 RPC 框架，gRPC 是现在的**行业事实标准**。

| 特性 | gRPC | Apache Thrift |
|------|------|---------------|
| 开发公司 | Google | Facebook（捐给 Apache） |
| 序列化协议 | Protobuf（Protocol Buffers） | Thrift 自有协议 |
| 传输协议 | 强制 HTTP/2 | TCP / HTTP |
| 支持语言 | 10+（Java、Go、Python、C++等） | 20+ |
| 性能 | 极高 | 极高（略高于 gRPC） |
| 生态 | 极好（K 8 s、云原生生态标配） | 一般 |
| 功能 | 流式调用、拦截器、负载均衡、TLS | 同左 |
| 学习曲线 | 中等 | 较陡 |
| 适用场景 | 云原生、微服务、跨语言调用 | 高性能、多语言异构系统 |

**结论**：优先学**gRPC**，生态好、文档全、未来趋势；Thrift 适合对性能要求极致的老系统。

### 三、gRPC 完整实战（Java）
GRPC 基于 Protobuf 和 HTTP/2，支持四种调用模式：一元调用、服务端流式、客户端流式、双向流式。我们先实现最常用的**一元调用**。

#### 1. 环境准备（Maven 依赖）
```xml
<dependencies>
    <!-- gRPC核心依赖 -->
    <dependency>
        <groupId>io.grpc</groupId>
        <artifactId>grpc-netty-shaded</artifactId>
        <version>1.64.0</version>
    </dependency>
    <dependency>
        <groupId>io.grpc</groupId>
        <artifactId>grpc-protobuf</artifactId>
        <version>1.64.0</version>
    </dependency>
    <dependency>
        <groupId>io.grpc</groupId>
        <artifactId>grpc-stub</artifactId>
        <version>1.64.0</version>
    </dependency>
    <!-- 注解处理器，自动生成代码 -->
    <dependency>
        <groupId>io.grpc</groupId>
        <artifactId>grpc-protobuf</artifactId>
        <version>1.64.0</version>
        <classifier>jdk8</classifier>
    </dependency>
</dependencies>

<build>
    <extensions>
        <extension>
            <groupId>kr.motd.maven</groupId>
            <artifactId>os-maven-plugin</artifactId>
            <version>1.7.1</version>
        </extension>
    </extensions>
    <plugins>
        <plugin>
            <groupId>org.xolstice.maven.plugins</groupId>
            <artifactId>protobuf-maven-plugin</artifactId>
            <version>0.6.1</version>
            <configuration>
                <protocArtifact>com.google.protobuf:protoc:3.25.3:exe:${os.detected.classifier}</protocArtifact>
                <pluginId>grpc-java</pluginId>
                <pluginArtifact>io.grpc:protoc-gen-grpc-java:1.64.0:exe:${os.detected.classifier}</pluginArtifact>
            </configuration>
            <executions>
                <execution>
                    <goals>
                        <goal>compile</goal>
                        <goal>compile-custom</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

#### 2. 编写 Protobuf 定义文件（`src/main/proto/hello.proto`）
Protobuf 是 gRPC 的接口定义语言（IDL），用来定义服务和消息结构。
```protobuf
syntax = "proto3"; // 指定Protobuf版本

option java_multiple_files = true;
option java_package = "com.example.grpc"; // 生成的Java代码包名
option java_outer_classname = "HelloProto";

// 定义服务
service HelloService {
  // 定义一个一元调用方法
  rpc SayHello (HelloRequest) returns (HelloResponse);
}

// 定义请求消息
message HelloRequest {
  string name = 1; // 字段编号，1-15占1字节，优先用
}

// 定义响应消息
message HelloResponse {
  string message = 1;
}
```

#### 3. 编译生成 Java 代码
执行 Maven 命令：`mvn clean compile`，会在 `target/generated-sources/protobuf` 目录下自动生成客户端和服务端的代码。

#### 4. 实现服务端
```java
package com.example.grpc;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import io.grpc.stub.StreamObserver;
import java.io.IOException;

public class HelloServer {
    public static void main(String[] args) throws IOException, InterruptedException {
        // 1. 构建服务器，绑定端口9090
        Server server = ServerBuilder.forPort(9090)
                .addService(new HelloServiceImpl()) // 注册服务实现
                .build();

        // 2. 启动服务器
        server.start();
        System.out.println("gRPC服务器启动，端口9090");

        // 3. 阻塞主线程，防止程序退出
        server.awaitTermination();
    }

    // 服务实现类，继承自动生成的HelloServiceGrpc.HelloServiceImplBase
    static class HelloServiceImpl extends HelloServiceGrpc.HelloServiceImplBase {
        @Override
        public void sayHello(HelloRequest request, StreamObserver<HelloResponse> responseObserver) {
            // 处理请求
            String name = request.getName();
            String message = "你好，" + name + "！这是gRPC服务器的回复";

            // 构建响应
            HelloResponse response = HelloResponse.newBuilder()
                    .setMessage(message)
                    .build();

            // 发送响应
            responseObserver.onNext(response);
            // 标记请求处理完成
            responseObserver.onCompleted();
        }
    }
}
```

#### 5. 实现客户端
```java
package com.example.grpc;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

public class HelloClient {
    public static void main(String[] args) {
        // 1. 创建通道，连接服务器
        ManagedChannel channel = ManagedChannelBuilder.forAddress("localhost", 9090)
                .usePlaintext() // 暂时不使用TLS加密
                .build();

        try {
            // 2. 创建客户端存根
            HelloServiceGrpc.HelloServiceBlockingStub stub = HelloServiceGrpc.newBlockingStub(channel);

            // 3. 调用远程方法，就像调用本地方法一样
            HelloRequest request = HelloRequest.newBuilder()
                    .setName("小白")
                    .build();
            HelloResponse response = stub.sayHello(request);

            // 4. 打印结果
            System.out.println("收到服务器回复：" + response.getMessage());
        } finally {
            // 5. 关闭通道
            channel.shutdown();
        }
    }
}
```

#### 6. 运行测试
先运行 `HelloServer`，再运行 `HelloClient`，就能看到客户端收到服务器的回复了！


### 四、实战：给 gRPC 加上 TLS 加密
上面的 gRPC 例子是明文传输的，非常不安全。我们给它加上 TLS 加密。

#### 1. 生成自签名证书（测试用）
生产环境用 Let's Encrypt 等 CA 颁发的免费证书。
```bash
# 生成服务端私钥
openssl genrsa -out server.key 2048

# 生成证书签名请求（CSR）
openssl req -new -key server.key -out server.csr

# 生成自签名证书（有效期365天）
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
```

#### 2. 修改服务端代码，启用 TLS
```java
import io.grpc.Server;
import io.grpc.ServerBuilder;
import io.grpc.netty.GrpcSslContexts;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import java.io.File;

public class TlsHelloServer {
    public static void main(String[] args) throws Exception {
        // 加载证书和私钥
        SslContext sslContext = GrpcSslContexts.forServer(
                new File("server.crt"),
                new File("server.key")
        ).build();

        // 构建启用TLS的服务器
        Server server = ServerBuilder.forPort(9090)
                .addService(new HelloServiceImpl())
                .sslContext(sslContext) // 启用TLS
                .build();

        server.start();
        System.out.println("TLS加密的gRPC服务器启动，端口9090");
        server.awaitTermination();
    }

    // 服务实现类和之前一样
    static class HelloServiceImpl extends HelloServiceGrpc.HelloServiceImplBase {
        @Override
        public void sayHello(HelloRequest request, StreamObserver<HelloResponse> responseObserver) {
            String message = "你好，" + request.getName() + "！这是TLS加密的回复";
            HelloResponse response = HelloResponse.newBuilder().setMessage(message).build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        }
    }
}
```

#### 3. 修改客户端代码，信任自签名证书
```java
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.netty.GrpcSslContexts;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import java.io.File;

public class TlsHelloClient {
    public static void main(String[] args) throws Exception {
        // 信任服务端的自签名证书
        SslContext sslContext = GrpcSslContexts.forClient()
                .trustManager(new File("server.crt"))
                .build();

        // 创建启用TLS的通道
        ManagedChannel channel = ManagedChannelBuilder.forAddress("localhost", 9090)
                .sslContext(sslContext) // 启用TLS
                .build();

        try {
            HelloServiceGrpc.HelloServiceBlockingStub stub = HelloServiceGrpc.newBlockingStub(channel);
            HelloRequest request = HelloRequest.newBuilder().setName("小白").build();
            HelloResponse response = stub.sayHello(request);
            System.out.println("收到TLS加密回复：" + response.getMessage());
        } finally {
            channel.shutdown();
        }
    }
}
```


## 学习建议与下一步
1. **先练 gRPC**：把上面的 gRPC 例子跑通，然后尝试实现流式调用、拦截器、错误处理
2. **再练 TLS**：给你之前写的 Netty 聊天室、HTTP 服务器都加上 TLS 加密
3. **深入方向**：
   - GRPC：负载均衡、服务发现、熔断限流（结合 Sentinel）
   - 网络安全：HTTPS 原理、WebSocket 加密、JWT 认证
1. **项目实战**：用 gRPC 写一个简单的微服务系统，包含用户服务、订单服务，并用 TLS 加密通信

需要我给你一份 gRPC 的进阶学习路线，或者 Netty 集成 TLS 的完整代码示例吗？