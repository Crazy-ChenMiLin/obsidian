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

## 4. 基础注意事项

### 4.1 Java版本要求
- 虚拟线程需要**Java 19+**（预览特性）或**Java 21+**（正式特性）
- 使用Java 19/20时需要添加`--enable-preview`参数

### 4.2 不适合虚拟线程的场景
- **CPU密集型任务**：虚拟线程不会提升CPU密集型任务的性能
- **使用synchronized的代码**：synchronized会阻塞底层操作系统线程
- **本地方法调用**：某些本地方法可能不支持虚拟线程