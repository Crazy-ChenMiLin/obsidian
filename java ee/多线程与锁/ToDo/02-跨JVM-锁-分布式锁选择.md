---
title: 跨 JVM 的锁（分布式锁选择）
tags: [分布式, 锁, Redis, ZooKeeper, Java]
aliases: ["分布式锁选择", "跨JVM 锁"]
---

目的：说明常见跨 JVM（分布式）锁的方案、利弊、示例代码片段与设计注意点。

常见方案对比：

- 数据库：使用行级锁、表锁或专门锁表。优点是实现简单、易于持久化；缺点是性能瓶颈、延迟较高。
- Redis：常用 SET key value NX PX ttl 模式 + Lua 脚本原子释放。优点是速度快，生态成熟；缺点是网络/主从/分区情况下的复杂性。
- ZooKeeper：使用临时顺序节点实现锁，具备强一致性，适合需要严格协调的场景，但部署和维护成本高。
- Etcd/Consul：云原生环境下的分布式协调服务，适合现代集群应用。
- Redisson：对 Redis 的高级封装，提供可重入锁、读写锁等便利 API，但依赖于 Redis 的可用性和正确配置。

Redis 简单示例（Java + Jedis）：

```java
// 获取锁
String result = jedis.set(lockKey, clientId, "NX", "PX", expireMillis);
if ("OK".equals(result)) {
    // 获得锁
}

// 释放锁（Lua 脚本，保证原子性）
String script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
jedis.eval(script, Collections.singletonList(lockKey), Collections.singletonList(clientId));
```

设计注意点：

- 使用唯一标识（clientId）以避免误删他人的锁。
- 设定合理 TTL，并设计续租（lease）机制以防任务执行时间超过锁超时时间。
- 处理 Redis 宕机或网络分区时的异常流程。

何时选用：

- 简单临界区且对性能有要求：Redis。
- 需要强一致性与协调（leader election、复杂任务调度）：ZooKeeper/Etcd。
