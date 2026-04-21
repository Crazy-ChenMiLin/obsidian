# Java虚拟线程-基础知识点

## 1. 定义/概念
Java虚拟线程是Java 21引入的轻量级线程实现，由JVM管理而非操作系统管理。虚拟线程可以创建数百万个线程，每个虚拟线程在底层操作系统线程上执行，当虚拟线程阻塞时，JVM会自动将其挂载到其他操作系统线程上继续执行。虚拟线程旨在简化高并发编程，让开发者像编写同步代码一样编写高并发应用。

## 2. 核心语法与核心要素

### 2.1 创建虚拟线程的方式
- **Thread.ofVirtual()**：创建虚拟线程构建器
- **Executors.newVirtualThreadPerTaskExecutor()**：创建虚拟线程执行器
- **Thread.startVirtualThread()**：快速启动虚拟线程

### 2.2 核心特性
- **轻量级**：内存占用极小，可创建百万级线程
- **自动调度**：JVM自动管理虚拟线程在操作系统线程上的调度
- **阻塞友好**：虚拟线程阻塞不会阻塞底层操作系统线程
- **兼容现有API**：与现有Thread API完全兼容

## 3. 基础用法与实操步骤

### 3.1方式一：使用Thread.ofVirtual()
```java
public class VirtualThreadBasic {
    public static void main(String[] args) {
        // 创建并启动虚拟线程
        Thread virtualThread = Thread.ofVirtual()
            .name("虚拟线程-1")
            .start(() -> {
                System.out.println("虚拟线程执行中: " + Thread.currentThread());
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("虚拟线程执行完毕");
            });
        
        // 等待虚拟线程完成
        try {
            virtualThread.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 3.2 方式二：使用Executors.newVirtualThreadPerTaskExecutor()
```java
import java.util.concurrent.*;

public class VirtualThreadExecutor {
    public static void main(String[] args) {
        // 创建虚拟线程执行器
        ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
        
        // 提交多个任务
        for (int i = 0; i < 10; i++) {
            final int taskId = i;
            executor.submit(() -> {
                System.out.println("任务 " + taskId + " 执行中: " + Thread.currentThread());
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("任务 " + taskId + " 完成");
            });
        }
        
        // 关闭执行器
        executor.shutdown();
        try {
            executor.awaitTermination(10, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 3.3 方式三：使用Thread.startVirtualThread()
```java
public class QuickVirtualThread {
    public static void main(String[] args) {
        // 快速启动虚拟线程
        Thread.startVirtualThread(() -> {
            System.out.println("快速启动的虚拟线程: " + Thread.currentThread());
        });
        
        // 主线程等待一下
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 3.4 三种方式的适用场景对比

#### Thread.ofVirtual() - 精细控制场景
**适用场景**：
- 需要对单个虚拟线程进行精细配置
- 需要设置线程名称、优先级、守护线程等属性
- 需要获取线程引用以便后续操作（如join、interrupt）
- 创建少量虚拟线程，需要对每个线程单独管理

**典型用例**：
```java
// 创建有名称的监控线程，便于调试和日志追踪
Thread monitorThread = Thread.ofVirtual()
    .name("订单监控线程")
    .daemon(true)
    .priority(Thread.NORM_PRIORITY - 1)
    .start(() -> {
        while (running) {
            monitorOrders();
            Thread.sleep(1000);
        }
    });

// 后续可以控制这个线程
monitorThread.interrupt();
monitorThread.join();
```

#### Executors.newVirtualThreadPerTaskExecutor() - 批量任务场景
**适用场景**：
- 需要执行大量并发任务（成百上千个）
- 需要统一管理任务的生命周期
- 需要优雅关闭和等待所有任务完成
- 与现有线程池代码兼容，方便迁移
- 需要限制任务提交速率或使用队列

**典型用例**：
```java
ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

try {
    List<CompletableFuture<Result>> futures = new ArrayList<>();
    
    for (Order order : orders) {
        CompletableFuture<Result> future = CompletableFuture.supplyAsync(
            () -> processOrder(order), 
            executor
        );
        futures.add(future);
    }
    
    // 等待所有订单处理完成
    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
    
} finally {
    executor.shutdown();
    executor.awaitTermination(1, TimeUnit.MINUTES);
}
```

#### Thread.startVirtualThread() - 快速启动场景
**适用场景**：
- 只需要快速启动一个虚拟线程，不需要后续控制
- fire-and-forget模式（启动后不需要join或管理）
- 简单的异步任务，不需要返回结果
- 临时性的后台任务
- 代码简洁性优先的场景

**典型用例**：
```java
// 异步发送日志，不关心结果
Thread.startVirtualThread(() -> {
    try {
        logService.sendAsync(logEntry);
    } catch (Exception e) {
    }
});

// 异步清理缓存
Thread.startVirtualThread(() -> {
    Thread.sleep(5000);
    cache.cleanup();
});
```

#### 场景选择总结
| 方式 | 线程数量 | 控制粒度 | 生命周期管理 | 典型场景 |
|------|----------|----------|--------------|----------|
| Thread.ofVirtual() | 少量（1-10个） | 精细配置 | 手动管理 | 监控线程、定时任务、需要命名的线程 |
| Executors.newVirtualThreadPerTaskExecutor() | 大量（100+） | 统一管理 | 自动管理 | 批量处理、并发请求、任务队列 |
| Thread.startVirtualThread() | 单个 | 无配置 | 无管理 | 异步日志、临时清理、fire-and-forget |

**选择建议**：
- 需要控制线程 → 用 `Thread.ofVirtual()`
- 批量处理任务 → 用 `Executors.newVirtualThreadPerTaskExecutor()`
- 快速启动不关心结果 → 用 `Thread.startVirtualThread()`


## 4. 基础注意事项

### 4.1 Java版本要求
- 虚拟线程需要**Java 19+**（预览特性）或**Java 21+**（正式特性）
- 使用Java 19/20时需要添加`--enable-preview`参数

### 4.2 不适合虚拟线程的场景
- **CPU密集型任务**：虚拟线程不会提升CPU密集型任务的性能
- **使用synchronized的代码**：synchronized会阻塞底层操作系统线程
- **本地方法调用**：某些本地方法可能不支持虚拟线程