## 什么是 ReentrantLock？

ReentrantLock 是 Java 中一种显式的锁机制，它是 `java.util.concurrent.locks` 包中的一个类，用于实现线程同步。

**关键词解析**：
- **显式锁**：需要手动获取和释放锁
- **可重入**：同一个线程可以多次获取同一个锁
- **Reentrant**：可重入的意思

## ReentrantLock 与 synchronized 的对比

| 特性        | ReentrantLock          | synchronized              |
| --------- | ---------------------- | ------------------------- |
| **创建锁对象** | New                    | 直接利用 Java 对象的监视器（monitor） |
| 获取方式      | 显式调用 lock() 方法         | 隐式获取（代码块或方法）              |
| 释放方式      | 显式调用 unlock() 方法       | 自动释放                      |
| 尝试获取      | 支持 tryLock() 尝试获取      | 不支持                       |
| 中断获取      | 支持 lockInterruptibly() | 不支持                       |
| 条件变量      | 支持 Condition           | 使用 Object 的 wait/notify   |

| 对比维度     | ReentrantLock                 | synchronized             |
| -------- | ----------------------------- | ------------------------ |
| **实现方式** | Java 类（API 层面实现）              | Java 关键字（JVM 层面实现）       |
| **锁释放**  | 手动释放（必须在 finally 中 unlock ()） | 自动释放（方法 / 代码块结束）         |
| 公平性      | 可指定公平 / 非公平（构造参数）             | 非公平锁（默认）                 |
| **可中断性** | 可中断（lockInterruptibly () 方法）  | 不可中断（线程阻塞后无法唤醒）          |
| **超时获取** | 支持（tryLock (long time)，超时放弃）  | 不支持（阻塞时一直等）              |
| **条件变量** | 支持（通过 Condition，更灵活）          | 支持（通过 wait ()/notify ()） |
| **适用场景** | 复杂场景（如公平锁、超时控制）               | 简单场景（如普通同步）              |
## 基本使用方法

### 步骤 1：创建 ReentrantLock 对象

```java
import java.util.concurrent.locks.ReentrantLock;

// 创建一个 ReentrantLock 对象
ReentrantLock lock = new ReentrantLock();

// 创建公平锁
ReentrantLock fairLock = new ReentrantLock(true);
```

### 步骤 2：获取锁

```java
lock.lock();
try {
    // 临界区代码，需要同步的操作
    // 例如：修改共享变量
} finally {
    // 释放锁，必须放在 finally 中确保锁一定被释放
    lock.unlock();
}
```

**注意**：释放锁必须放在 `finally` 块中，这样即使发生异常，锁也能被正确释放。

## 常用方法

### 1. lock()

获取锁，如果锁被其他线程占用，则一直等待。

### 2. tryLock()
[[抢锁代码]]
尝试获取锁，立即返回结果：
- 如果获取成功，返回 `true`
- 如果获取失败，返回 `false`，不会阻塞
```java
if (lock.tryLock()) {
    try {
        // 临界区代码
    } finally {
        lock.unlock();
    }
} else {
    // 无法获取锁，执行其他操作
}
```

### 3. tryLock(long time, TimeUnit unit)

在指定时间内尝试获取锁：
- 如果在指定时间内获取成功，返回 `true`
- 如果超时，返回 `false`

```java
if (lock.tryLock(1, TimeUnit.SECONDS)) {
    try {
        // 临界区代码
    } finally {
        lock.unlock();
    }
} else {
    // 超时，无法获取锁
}
```

### 4. lockInterruptibly()

获取锁，但可以被中断：
- 如果锁被其他线程占用，会等待
- 如果线程被中断，会抛出 InterruptedException 异常

```java
try {
    lock.lockInterruptibly();
    try {
        // 临界区代码
    } finally {
        lock.unlock();
    }
} catch (InterruptedException e) {
    // 处理中断
}
```

### 5. unlock()

释放锁，必须在 finally 块中调用。

### 6. isLocked()

检查锁是否被占用。

### 7. isHeldByCurrentThread()

检查当前线程是否持有锁。

### 8. getHoldCount()

获取当前线程持有锁的次数（因为可重入）。

## 可重入性示例

```java
public class ReentrantExample {
    private final ReentrantLock lock = new ReentrantLock();
    
    public void outer() {
        lock.lock();
        try {
            System.out.println("获取锁，次数：" + lock.getHoldCount());
            inner(); // 同一个线程可以再次获取同一个锁
        } finally {
            lock.unlock();
            System.out.println("释放锁，次数：" + lock.getHoldCount());
        }
    }
    
    public void inner() {
        lock.lock();
        try {
            System.out.println("再次获取锁，次数：" + lock.getHoldCount());
            // 执行操作
        } finally {
            lock.unlock();
            System.out.println("再次释放锁，次数：" + lock.getHoldCount());
        }
    }
    
    public static void main(String[] args) {
        ReentrantExample example = new ReentrantExample();
        example.outer();
    }
}

控制台

获取锁，次数：1

再次获取锁，次数：2

再次释放锁，次数：1

释放锁，次数：0
```

## 公平锁与非公平锁

- **公平锁**：按照线程请求锁的顺序获取锁，避免线程饥饿
- **非公平锁**：线程获取锁的顺序不确定，可能导致某些线程一直获取不到锁

```java
// 创建公平锁
ReentrantLock fairLock = new ReentrantLock(true);

// 创建非公平锁（默认）
ReentrantLock nonFairLock = new ReentrantLock(false);
ReentrantLock defaultLock = new ReentrantLock(); // 默认非公平
```

**注意**：公平锁的性能通常比非公平锁差，因为需要维护一个等待队列。

## Condition 条件变量

ReentrantLock 可以创建 Condition 对象，用于线程间的通信：

```java
ReentrantLock lock = new ReentrantLock();
Condition condition = lock.newCondition();

// 等待条件满足
lock.lock();
try {
    while (!conditionMet) {
        condition.await(); // 释放锁并等待
    }
    // 条件满足，执行操作
} finally {
    lock.unlock();
}

// 通知等待的线程
lock.lock();
try {
    conditionMet = true;
    condition.signal(); // 通知一个等待的线程
    // 或 condition.signalAll(); // 通知所有等待的线程
} finally {
    lock.unlock();
}
```


| 特性       | **synchronized (修饰方法)** | **ReentrantLock (显式锁)**                |
| :------- | :---------------------- | :------------------------------------- |
| **写法**   | 极简，自动加锁、自动释放            | 手动 `lock()` / `unlock()`，必须放 `finally` |
| **锁对象**  | 隐式锁，锁**当前对象 (this)**    | 显式锁，自己创建锁对象，想锁啥锁啥                      |
| **功能**   | 基础版，只有「加锁 / 解锁」         | 高级版，支持 `tryLock`、`Condition`、公平锁       |
| **灵活性**  | 低，无法手动控制                | 高，支持线程等待唤醒、超时抢锁                        |
| **适用场景** | 简单线程安全（你的计数器）           | 复杂线程协作（生产者消费者、顺序执行）                    |
| 公平       | 非公平锁                    | 公平锁                                    |

# 注意事项和最佳实践
 
 1. **必须在 finally 块中释放锁**，否则可能导致死锁
 2. **不要在锁内执行耗时操作**，会导致其他线程长时间等待
 3. **合理使用 tryLock()**，避免线程长时间阻塞
 4. **根据实际需求选择公平锁或非公平锁**
 5. **注意可重入次数**，获取和释放的次数必须一致
 6. **避免嵌套锁**，可能导致死锁
 
 ## 什么时候使用 ReentrantLock？
 - 需要尝试获取锁而不阻塞时
 - 需要可中断的锁获取时
 - 需要多个条件变量时
 
 ## 总结
 
 ReentrantLock 是一种功能强大的显式锁，它提供了比 synchronized 更多的功能和灵活性。虽然使用起来稍微复杂一些，但在需要更精细的锁控制时，它是一个非常好的选择。
 
 作为小白，建议先掌握基本的使用方法，然后逐步学习其高级特性。记住，无论使用哪种锁机制，都要确保正确获取和释放锁，避免死锁和其他并发问题。
