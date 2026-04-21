# Java虚拟线程-配套题目

## 一、判断题

### 题目1
虚拟线程是Java 8引入的特性。

**答案**：错误
**解析**：虚拟线程是Java 19作为预览特性引入，Java 21正式发布的特性。

### 题目2
虚拟线程由JVM管理，而不是操作系统管理。

**答案**：正确
**解析**：虚拟线程是JVM层面的轻量级线程实现，由JVM的调度器管理，不依赖操作系统的线程调度。

### 题目3
虚拟线程可以提升CPU密集型任务的性能。

**答案**：错误
**解析**：虚拟线程主要优化I/O密集型任务，不会增加CPU计算能力，CPU密集型任务应该使用平台线程或ForkJoinPool。

## 二、选择题

### 题目1
以下哪个方法用于创建虚拟线程？

A. Thread.newVirtual()
B. Thread.ofVirtual()
C. Thread.createVirtual()
D. Thread.virtual()

**答案**：B
**解析**：Thread.ofVirtual()是创建虚拟线程的标准方法，返回一个虚拟线程构建器。

### 题目2
虚拟线程的调度模型是：

A. 1:1调度模型
B. M:N调度模型
C. N:1调度模型
D. 随机调度模型

**答案**：B
**解析**：虚拟线程采用M:N调度模型，即M个虚拟线程映射到N个操作系统线程上。

### 题目3
以下哪种情况不适合使用虚拟线程？

A. 高并发HTTP请求
B. 数据库查询操作
C. CPU密集型计算任务
D. 文件I/O操作

**答案**：C
**解析**：虚拟线程主要优化I/O密集型任务，CPU密集型任务不会从虚拟线程中受益。

### 题目4
在虚拟线程中使用synchronized会导致什么问题？

A. 编译错误
B. 运行时异常
C. 阻塞底层载体线程
D. 没有任何问题

**答案**：C
**解析**：synchronized会阻塞底层的载体线程，降低虚拟线程的并发性能，应该使用ReentrantLock替代。

## 三、简答题

### 题目1（基础题）
请简述Java虚拟线程的定义和核心优势。

**参考答案**：
Java虚拟线程是Java 21引入的轻量级线程实现，由JVM管理而非操作系统管理。

核心优势：
1. **轻量级**：内存占用极小，可创建百万级线程
2. **低成本**：创建和销毁成本极低
3. **自动调度**：JVM自动管理虚拟线程在操作系统线程上的调度
4. **阻塞友好**：虚拟线程阻塞不会阻塞底层操作系统线程
5. **简化编程**：可以用同步代码风格编写高并发应用

### 题目2（进阶题）
请解释虚拟线程的M:N调度模型及其工作原理。

**参考答案**：
M:N调度模型是指M个虚拟线程映射到N个操作系统线程上执行，其中N通常等于CPU核心数。

工作原理：
1. **载体线程**：虚拟线程运行在JVM的ForkJoinPool工作线程（载体线程）上
2. **调度器**：JVM维护虚拟线程调度器，负责将虚拟线程分配到载体线程
3. **卸载机制**：当虚拟线程执行I/O操作等阻塞操作时，JVM将其从载体线程上卸载
4. **重新调度**：当阻塞操作完成时，虚拟线程被重新调度到可用的载体线程上
5. **连续体**：虚拟线程的执行状态保存在连续体中，支持挂起和恢复

这种机制使得少量载体线程可以高效执行大量虚拟线程，大幅提升I/O密集型应用的并发能力。

## 四、代码补全题

### 题目1（基础题）
请补全以下代码，创建并启动10个虚拟线程，每个线程打印自己的线程名称。

```java
import java.util.concurrent.*;

public class VirtualThreadExercise {
    public static void main(String[] args) {
        // 创建虚拟线程执行器
        ExecutorService executor = ____________________;
        
        // 启动10个虚拟线程
        for (int i = 0; i < 10; i++) {
            final int threadId = i;
            executor.submit(() -> {
                System.out.println("虚拟线程 " + threadId + ": " + ____________________);
            });
        }
        
        // 关闭执行器并等待完成
        executor.____________________;
        try {
            executor.____________________(10, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

**补全说明**：
1. 第一空：创建虚拟线程执行器的方法
2. 第二空：获取当前线程对象
3. 第三空：关闭执行器的方法
4. 第四空：等待执行器终止的方法

**完整代码**：
```java
import java.util.concurrent.*;

public class VirtualThreadExercise {
    public static void main(String[] args) {
        // 创建虚拟线程执行器
        ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
        
        // 启动10个虚拟线程
        for (int i = 0; i < 10; i++) {
            final int threadId = i;
            executor.submit(() -> {
                System.out.println("虚拟线程 " + threadId + ": " + Thread.currentThread());
            });
        }
        
        // 关闭执行器并等待完成
        executor.shutdown();
        try {
            executor.awaitTermination(10, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 题目2（进阶题）
请补全以下代码，使用结构化并发并发执行3个HTTP请求，并收集所有结果。

```java
import java.util.concurrent.*;
import java.net.http.*;
import java.net.*;

public class StructuredConcurrencyExercise {
    private static final HttpClient client = HttpClient.newHttpClient();
    
    public static void main(String[] args) {
        String[] urls = {
            "https://api.example.com/users",
            "https://api.example.com/products",
            "https://api.example.com/orders"
        };
        
        try (var scope = ____________________) {
            // 并发执行多个HTTP请求
            Supplier<String>[] futures = new Supplier[urls.length];
            
            for (int i = 0; i < urls.length; i++) {
                final int index = i;
                futures[i] = scope.fork(() -> {
                    try {
                        HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(urls[index]))
                            .build();
                        
                        HttpResponse<String> response = client.send(request,
                            HttpResponse.BodyHandlers.____________________);
                        
                        return response.body();
                    } catch (Exception e) {
                        return "请求失败: " + e.getMessage();
                    }
                });
            }
            
            // 等待所有任务完成
            scope.____________________;
            scope.____________________;
            
            // 输出结果
            for (int i = 0; i < futures.length; i++) {
                System.out.println("URL " + i + ": " + futures[i].____________________);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

**补全说明**：
1. 第一空：创建结构化任务作用域
2. 第二空：指定响应体处理器
3. 第三空：等待所有任务完成的方法
4. 第四空：检查任务是否失败的方法
5. 第五空：获取任务结果的方法

**完整代码**：
```java
import java.util.concurrent.*;
import java.net.http.*;
import java.net.*;

public class StructuredConcurrencyExercise {
    private static final HttpClient client = HttpClient.newHttpClient();
    
    public static void main(String[] args) {
        String[] urls = {
            "https://api.example.com/users",
            "https://api.example.com/products",
            "https://api.example.com/orders"
        };
        
        try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
            // 并发执行多个HTTP请求
            Supplier<String>[] futures = new Supplier[urls.length];
            
            for (int i = 0; i < urls.length; i++) {
                final int index = i;
                futures[i] = scope.fork(() -> {
                    try {
                        HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(urls[index]))
                            .build();
                        
                        HttpResponse<String> response = client.send(request,
                            HttpResponse.BodyHandlers.ofString());
                        
                        return response.body();
                    } catch (Exception e) {
                        return "请求失败: " + e.getMessage();
                    }
                });
            }
            
            // 等待所有任务完成
            scope.join();
            scope.throwIfFailed();
            
            // 输出结果
            for (int i = 0; i < futures.length; i++) {
                System.out.println("URL " + i + ": " + futures[i].get());
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```