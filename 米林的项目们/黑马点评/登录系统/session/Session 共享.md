# 一.分布式集群架构中，实现 Session 共享？
1. **Session 复制**
    
    利用 Web 容器（如 Tomcat）的 Session 复制机制，集群节点间同步 Session 数据。但节点过多时会增加网络开销，适合小规模集群。
    
    
1. **中间件存储**
    
    把 Session 数据统一存储到外部中间件（如 Redis、Memcached），所有节点从中间件读写 Session。这是主流方案，支持高可用和横向扩展，需注意中间件的性能和稳定性。
    
1. **基于 Token 的方式**
    
    用 JWT 等 Token 替代 Session，Token 包含用户信息（加密后），客户端存储 Token 并在请求时携带，服务端无需存储 Session。但 Token 无法主动失效，适合对安全性要求不高的场景。
