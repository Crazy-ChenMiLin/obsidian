### 实战：给 gRPC 加上 TLS 加密

上面的 gRPC 例子是明文传输的，非常不安全。我们给它加上 TLS 加密。

#### 1. 生成自签名证书（测试用）

生产环境用 Let's Encrypt 等 CA 颁发的免费证书。

```
# 生成服务端私钥
openssl genrsa -out server.key 2048

# 生成证书签名请求（CSR）
openssl req -new -key server.key -out server.csr

# 生成自签名证书（有效期365天）
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
```

#### 2. 修改服务端代码，启用 TLS

```
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

```
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

### 五、常见安全坑点

1. **不要自己实现加密算法**：永远使用成熟的库（JDK 自带、BouncyCastle）
2. **禁用不安全的算法和协议**：禁用 SSLv 3、TLS 1.0/1.1，禁用 MD 5、DES、3 DES
3. **证书管理**：定期更新证书，不要泄露私钥
4. **不要硬编码密钥**：密钥应该存在配置中心或密钥管理服务中

---

## 学习建议与下一步

1. **先练 gRPC**：把上面的 gRPC 例子跑通，然后尝试实现流式调用、拦截器、错误处理
2. **再练 TLS**：给你之前写的 Netty 聊天室、HTTP 服务器都加上 TLS 加密
3. **深入方向**：
    
    - GRPC：负载均衡、服务发现、熔断限流（结合 Sentinel）
    - 网络安全：HTTPS 原理、WebSocket 加密、JWT 认证
    
4. **项目实战**：用 gRPC 写一个简单的微服务系统，包含用户服务、订单服务，并用 TLS 加密通信
