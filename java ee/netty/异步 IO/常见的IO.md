
| 大类         | 具体 IO 类型            | 典型操作 / Java 代码示例                                  | 是否阻塞 | 适合虚拟线程？ | 一句话特点          |
| :--------- | :------------------ | :------------------------------------------------ | :--- | :------ | :------------- |
| **磁盘 IO**  | 文件读写                | FileInputStream、Files.read/write、RandomAccessFile | ✅ 阻塞 | ✅ 非常适合  | 等待硬盘读写，CPU 空闲  |
|            | 日志写入                | logback/log4j 写文件                                 | ✅ 阻塞 | ✅ 适合    | 高频小 IO，阻塞时间短   |
|            |                     |                                                   |      |         |                |
| **网络 IO**  | HTTP/HTTPS          | RestTemplate、HttpClient、OkHttp                    | ✅ 阻塞 | ✅ 非常适合  | 等网络返回，典型 IO 阻塞 |
|            | RPC 调用              | Dubbo、gRPC、Feign                                  | ✅ 阻塞 | ✅ 非常适合  | 内网 / 外网网络等待    |
|            | Socket 通信/WebSocket | ServerSocket、Socket 收发数据                          | ✅ 阻塞 | ✅ 适合    | 建立连接 + 收发包均阻塞  |
|            | Ping 探测             | isReachable、ICMP 发包                               | ✅ 阻塞 | ✅ 适合    | 发包→等回复，纯网络等待   |
|            | 消息队列                | RabbitMQ/ Kafka 同步收发                              | ✅ 阻塞 | ✅ 适合    | 网络 + 中间件 IO 等待 |
|            |                     |                                                   |      |         |                |
|            |                     |                                                   |      |         |                |
| **数据库 IO** | JDBC 查询             | JDBC、MyBatis、JPA 查询                               | ✅ 阻塞 | ✅ 非常适合  | 等数据库磁盘 + 网络返回  |
|            | 连接操作                | 获取连接、事务提交                                         | ✅ 阻塞 | ✅ 适合    | 网络 + 数据库内部 IO  |
|            |                     |                                                   |      |         |                |
| **特殊阻塞**   | 线程休眠                | Thread.sleep                                      | ✅ 阻塞 | ✅ 适合    | 主动挂起，等价 IO 阻塞  |
|            | 锁等待                 | synchronized、ReentrantLock                        | ✅ 阻塞 | ⚠️ 谨慎   | 阻塞但不是 IO，不提升吞吐 |
