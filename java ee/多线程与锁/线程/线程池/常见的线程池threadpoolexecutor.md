# ① JDK 自带工具 `Executors` 快速创建的 4 种（**生产环境全部禁用**）
	1.executors.newFixedThreadpool()
	2.executors.newSingleThreadExecutor()
	3.executors.newCachedThreadPool(n)
	4.executors.newScheduledThreadPool

![[常见的线程池 2026-04-13 12.56.17.excalidraw]]



# ② 生产环境：Threadpoolexecutor
## 适合：异步查询、异步通知、异步计算、非阻塞获取结果
```java

Import org. Springframework. Stereotype. Service;
Import java. Util. Concurrent.*;
Import javax. Annotation. PostConstruct;
Import javax. Annotation. PreDestroy;

@Service
Public class AsyncService {

    private ThreadPoolExecutor asyncPool;
   // 1.初始化threadpoolexecutor线程池
    @PostConstruct
    public void initPool() {
        asyncPool = new ThreadPoolExecutor(
                5,                  // 核心线程
                10,                 // 最大线程
                60L,                // 空闲时间
                TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(100), // 有界队列（防OOM）
                new ThreadFactoryBuilder().setNameFormat("async-pool-%d").build(),
                new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略：让主线程执行
        );
    }
		//2.做异步thread任务
    public String doAsyncBiz() {
        //2-1异步执行 业务代码
        //2-2completableFuture包装，拿到异步结果
        //2-3get方法拿到
        CompletableFuture<String> 异步结果 = CompletableFuture.supplyAsync(
                this::异步业务逻辑,  // 要执行的任务（抽成单独方法，不嵌套）
                asyncPool            // 指定用我们的自定义线程池
        );
        // ========== 步骤2：等待结果（最多等3秒，防止卡死） ==========
        try {
            // 3秒内拿到结果，直接返回
            return 异步结果.get(3, TimeUnit.SECONDS);
        }
        // 超时/报错 → 返回失败
        catch (Exception e) {
            return "执行失败";
        }
    }

    // 抽离出来的【异步业务代码】
    private String 异步业务逻辑() {
        // 打印当前执行的线程名
        System.out.println("异步线程执行：" +Thread.currentThread().getName());

        // 模拟业务：查库、调接口、计算...
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // 返回最终结果
        return "异步执行结果";
    }
    
    
    
    
    //3.关闭池子
    @PreDestroy
    public void shutdown() {
        asyncPool.shutdown();
    }
}
```

# Threadpoolexecutor
- **ThreadPoolExecutor 里的每一个 Thread，都是独立异步线程**
- 它们在**后台运行，不会阻塞你的主线程（比如接口请求线程）**
- 主线程把任务丢给线程池后，就可以继续干别的，这就是异步




# 为什么不能直接 method implements callable？
1. 不是异步，调用方法拿不到 callable 的结果就会死锁