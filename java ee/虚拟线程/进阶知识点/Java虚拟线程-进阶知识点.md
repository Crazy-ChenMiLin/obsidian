# Java虚拟线程-进阶知识点

## 1. 底层原理深化

### 1.1 虚拟线程的调度机制
虚拟线程采用**M:N调度模型**，即M个虚拟线程映射到N个操作系统线程（N通常等于CPU核心数）。JVM维护一个虚拟线程调度器，当虚拟线程执行I/O操作、锁等待等阻塞操作时，JVM会自动将虚拟线程从操作系统线程上卸载，操作系统线程可以执行其他虚拟线程。当阻塞操作完成时，虚拟线程会被重新调度到可用的用的操作系统线程上继续执行。

### 1.2 载体线程
虚拟线程运行在**载体线程**上，载体线程是JVM的ForkJoinPool工作线程。默认情况下，载体线程数量等于CPU核心数。可以通过系统属性`jdk.virtualThreadScheduler.parallelism`调整载体线程数量。

### 1.3 连续体
虚拟线程的执行状态保存在**连续体**中，连续体是虚拟线程的调用栈快照。当虚拟线程被卸载时，其执行状态被保存到连续体中；当虚拟线程被重新调度时，JVM从连续体恢复执行状态。

## 2. 高级拓展用法

### 2.1 结构化并发
```java
import java.util.concurrent.*;
import java.util.stream.*;

public class StructuredConcurrency {
    public static void main(String[] args) {
        try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
            // 并发执行多个任务
            Supplier<String> task1 = scope.fork(() -> {
                Thread.sleep(1000);
                return "任务1结果";
            });
            
            Supplier<Integer> task2 = scope.fork(() -> {
                Thread.sleep(800);
                return 42;
            });
            
            // 等待所有任务完成
            scope.join();
            scope.throwIfFailed();
            
            // 获取结果
            System.out.println("任务1: " + task1.get());
            System.out.println("任务2: " + task2.get());
            
            } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### 2.2 虚拟线程与CompletableFuture结合
```java
import java.util.concurrent.*;

public class VirtualThreadWithFuture {
    public static void main(String[] args) {
        ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor();
        
        // 创建异步任务
        CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
            System.out.println("异步任务执行: " + Thread.currentThread());
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
            }
            return "异步结果";
        }, virtualExecutor);
        
        // 链式操作
        future.thenApplyAsync(result -> {
            System.out.println("处理结果: " + result);
            return result.toUpperCase();
        }, virtualExecutor).thenAcceptAsync(finalResult -> {
            System.out.println("最终结果: " + finalResult);
        }, virtualExecutor);
        
        // 等待完成
        future.join();
        virtualExecutor.shutdown();
    }
}
```

### 2.3 虚拟线程池监控
```java
import java.util.concurrent.*;
import java.lang.management.*;

public class VirtualThreadMonitoring {
    public static void main(String[] args) {
        ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
        
        // 启动监控线程
        Thread monitorThread = Thread.ofPlatform().start(() -> {
            while (true) {
                ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
                long virtualThreadCount = Thread.getAllStackTraces().keySet().stream()
                    .filter(Thread::isVirtual)
                    .count();
                
                System.out.println("当前虚拟线程数: " + virtualThreadCount);
                System.out.println("总线程数: " + threadBean.getThreadCount());
                
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    break;
                }
            }
        });
        
        // 提交大量任务
        for (int i = 0; i < 1000; i++) {
            final int taskId = i;
            executor.submit(() -> {
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                }
            });
        }
        
        executor.shutdown();
        try {
            executor.awaitTermination(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
        }
        monitorThread.interrupt();
    }
}
```

## 3. 高频易错点与踩坑指南

### 3.1 synchronized会阻塞载体线程
**错误示例**：
```java
public class SynchronizedBlocking {
    private static final Object LOCK = new Object();
    
    public static void main(String[] args) {
        ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
        
        for (int i = 0; i < 100; i++) {
            executor.submit(() -> {
                synchronized (LOCK) {  // 错误：会阻塞载体线程
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                    }
                }
            });
        }
    }
}
```

**正确做法**：使用ReentrantLock替代synchronized
```java
import java.util.concurrent.locks.*;

public class ReentrantLockNonBlocking {
    private static final ReentrantLock LOCK = new ReentrantLock();
    
    public static void main(String[] args) {
        ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
        
        for (int i = 0; i < 100; i++) {
            executor.submit(() -> {
                LOCK.lock();
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                } finally {
                    LOCK.unlock();
                }
            });
        }
    }
}
```

### 3.2 ThreadLocal内存泄漏
虚拟线程数量巨大时，ThreadLocal可能导致严重的内存泄漏。虚拟线程的ThreadLocal不会自动清理，需要手动清理。

**正确做法**：
```java
public class ThreadLocalCleanup {
    private static final ThreadLocal<String> CONTEXT = new ThreadLocal<>();
    
    public static void main(String[] args) {
        ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
        
        executor.submit(() -> {
            try {
                CONTEXT.set("任务上下文");
                // 执行任务
            } finally {
                CONTEXT.remove();  // 必须手动清理
            }
        });
    }
}
```

### 3.3 不适合CPU密集型任务
虚拟线程不会增加CPU计算能力，CPU密集型任务应该使用平台线程或ForkJoinPool。

## 4. 关联知识点对比

### 4.1 虚拟线程 vs 平台线程
| 特性 | 虚拟线程 | 平台线程 |
|------|----------|----------|
| 创建成本 | 极低 | 高 |
| 内存占用 | 几KB | 几MB |
| 数量限制 | 百万级 | 几千级 |
| 调度方式 | JVM调度 | 操作系统调度 |
| 适用场景 | I/O密集型 | CPU密集型 |

### 4.2 虚拟线程 vs 异步编程
虚拟线程的优势在于可以用同步代码风格编写异步逻辑，避免了回调地狱和复杂的异步状态管理。

## 5. 生产环境实战场景

### 5.1 高并发HTTP请求
```java
import java.net.http.*;
import java.util.concurrent.*;
import java.util.*;

public class HighConcurrencyHttp {
    private static final HttpClient client = HttpClient.newHttpClient();
    
    public static void main(String[] args) {
        ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
        List<CompletableFuture<String>> futures = new ArrayList<>();
        
        // 并发发送1000个HTTP请求
        for (int i = 0; i < 1000; i++) {
            final int requestId = i;
            CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
                try {
                    HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.example.com/data/" + requestId))
                        .build();
                    
                    HttpResponse<String> response = client.send(request, 
                        HttpResponse HttpResponse.BodyHandlers.ofString());
                    
                    return response.body();
                } catch (Exception e) {
                    return "错误: " + e.getMessage();
                }
            }, executor);
            
            futures.add(future);
        }
        
        // 等待所有请求完成
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        
        executor.shutdown();
    }
}
```

### 5.2 数据库连接池优化
虚拟线程可以大幅减少数据库连接池的连接数量，因为虚拟线程在等待数据库响应时不会占用连接。