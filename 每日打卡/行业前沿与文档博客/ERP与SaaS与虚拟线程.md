# ERP: enterprise Resource planning 
	整合企业各项业务流程和数据的管理信息系统
	目标：资源统一化管理
核心板块：
	财务管理，供应链（库存），采购，生产制造，销售订单，客户关系，hr, 报表与 BI
	部署形式：本地部署，云端（SaaS）


# 云端（SaaS）： Software as a Service，中文通常译为“软件即服务”
	通过互联网提供的软件服务，用户不用自己安装或者维护服务器，只需要通过浏览器或者轻量客户端登录。供应商负责运维，安全



**QPS = Queries Per Second**

直译：**每秒能处理多少个请求**

# 虚拟线程

	里面的 Redis 操作（IO 阻塞）秒杀时查库存是「IO 操作」（程序要等 Redis 返回结果，这段时间传统线程会 “闲着占坑”，虚拟线程会 “暂时让坑”，能处理更多请求）
``` java
class seckillController{
	@GetMapping("seckill")
	public  CompletableFuture<ResponseEntity<String>> seckill(){
			return CompletableFuture.supplyAsync(() ->{
			if (redisTemplate.opsForValue().decrement("stock")<0)
				return ResponseEntity.ok("fail");
			   }
			   return ResponseEntity.ok("success");
			   },
			   Executors.newVirtualThreadperTaskExecutor());			   )
		}
	}
```

	ConpletableFuture.supplyAsync(任务，线程池)
		异步执行任务，指定一个线程池
		
	Executors.newVirtualThreadPerTaskExecutor()
		jdk21 创建一个线程池（来一个新任务就去创建一个虚拟线程）


✅ Go：天生能扛高并发，调 Redis 不用额外折腾（代码 / 配置），写啥样跑啥样；

✅ Java：想扛高并发得 “配套操作”—— 要么调 JVM 参数，要么搭异步框架 / 线程池，虚拟线程能提性能但离不开这些配套。