### Synchronized: 互斥锁的原因：
	1. 同一时间，已有一个线程能持有锁：无论锁的是this/类对象（xx. Class）/自定义对象（new object）
	2. 未强到锁的进程会被阻塞

## 经典错误的代码例子
 
```java
 
public class ThreadPreemptDemo {
    // 共享变量：两个线程要同时修改它
    private static int count = 0;

    public static void main(String[] args) throws InterruptedException {
        // 创建两个线程，都执行“count加1”的操作
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                count++; // 线程1对count加1
            }
        });

        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                count++; // 线程2对count加1
            }
        });

        // 启动两个线程
        t1.start();
        t2.start();
        // 等待两个线程执行完毕
        t1.join();
        t2.join();

        // 预期结果是 20000，但实际会小于20000（因为线程抢占）
        System.out.println("最终count值：" + count);
    }
}
```
 
问题分析：
两个线程同时修改 count 变量，当线程 1 刚执行 count++ 的“读取”操作（还没来得及“修改”）时，CPU 可能切换到线程 2，线程 2 也读取了同一个旧的 count 值，导致最终 count 的增量被“覆盖”，结果远小于预期的 20000 。
 
==示例 2：用 synchronized 解决线程抢占==
 
==解决原理：==
 ==Synchronized 给 increment () 方法加了“锁”，同一时间只有一个线程能进入该方法执行 count++ ，彻底避免了“读取-修改”过程被抢占的问题==
 
``` java
public class ThreadPreemptFixedDemo {
    private static int count = 0;
<!--ID: 1762089296649-->


    // 加锁的方法：同一时间只有一个线程能执行
    private static synchronized void increment() {
        count++;
    }

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                increment(); // 调用加锁的方法
            }
        });

        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                increment(); // 调用加锁的方法
            }
        });

        t1.start();
        t2.start();
        t1.join();
        t2.join();

        // 现在结果会稳定是20000
        System.out.println("最终count值：" + count);
    }
}
 

```






