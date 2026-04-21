---
title: wait() / notify() / notifyAll()
tags: [wait, notify, notifyAll, Java, 并发]
aliases: ["wait notify 区别"]
---

核心：wait/notify 是 Object 上的方法，用于线程之间通过监视器进行协调。调用 wait() 会释放锁并进入等待，调用 notify()/notifyAll() 用于唤醒等待线程（但被唤醒线程需要重新竞争锁）。

主要区别：

- notify(): 唤醒等待队列中的单个线程（JVM 决定哪一个），不保证唤醒的是正确条件对应的线程。
- notifyAll(): 唤醒所有等待线程，通常更安全（尤其当多个条件在同一监视器上等待时）。

使用规范：

- 必须在同步块或同步方法内调用 wait()/notify()/notifyAll()，否则抛 IllegalMonitorStateException。
- 使用 while 检查等待条件（防止虚假唤醒）：

```java
synchronized(lock) {
    while (!condition) {
        lock.wait();
    }
    // proceed
}
```

生产者/消费者示例：见 [[09-附录-代码片段与示例]] 中的 BoundedBuffer。

何时使用 notifyAll：

- 当多个不同条件的线程共享同一 monitor 时，notify 可能会唤醒不相关的线程导致无法前进；notifyAll 更保险但会带来更多竞争开销。
