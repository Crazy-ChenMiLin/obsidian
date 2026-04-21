### 1. 争抢的结果是随机的（CPU 说了算）

- 可能消费者抢赢 → 先执行 `consume()`
- 可能生产者抢赢 → 先执行 `produce()`

```java
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class ConditionCommunication {
    private final ReentrantLock lock = new ReentrantLock();
    // 绑定锁创建Condition，用于线程间等待/唤醒
    private final Condition condition = lock.newCondition();
    // 共享资源：是否有产品
    private boolean hasProduct = false;

    // 生产者线程：生产产品
    public void produce() {
        lock.lock();
        try {
            // 如果已有产品，生产者等待
            while (hasProduct) {
                System.out.println(Thread.currentThread().getName() + "：产品已满，进入等待");
                condition.await(); // 释放锁，阻塞等待消费者唤醒
            }
            // 生产产品
            hasProduct = true;
            System.out.println(Thread.currentThread().getName() + "：生产完成，唤醒消费者");
            condition.signal(); // 唤醒消费者线程
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            lock.unlock();
        }
    }

    // 消费者线程：消费产品
    public void consume() {
        lock.lock();
        try {
            // 如果没有产品，消费者等待
            while (!hasProduct) {
                System.out.println(Thread.currentThread().getName() + "：暂无产品，进入等待");
                condition.await(); // 释放锁，阻塞等待生产者唤醒
            }
            // 消费产品
            hasProduct = false;
            System.out.println(Thread.currentThread().getName() + "：消费完成，唤醒生产者");
            condition.signal(); // 唤醒生产者线程
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            lock.unlock();
        }
    }

    public static void main(String[] args) {
        ConditionCommunication demo = new ConditionCommunication();

        // 生产者线程
        new Thread(demo::produce, "生产者线程").start();
        // 消费者线程
        new Thread(demo::consume, "消费者线程").start();
    }
}

```


# 2. 适配线程池的任务调用
CPU 随机分配执行权 → 线程抢着运行；
	- 线程运行后抢 `ReentrantLock` 锁；
	- 抢不到锁 / 不符合条件 → `Condition` 等待；
	- 条件满足 → 唤醒继续抢锁执行。


# 3 . Condiition 场景
1. **生产者 - 消费者模式**（你写的代码）
    
    消费者没产品 → 必须等；生产者产品满了 → 必须等；
2. **线程顺序执行**
    
    要求：线程 A 执行完 → 线程 B 才能执行；
3. **多条件精准唤醒**
    
    比如：库存不足唤醒生产者，库存满了唤醒消费者（互不干扰）；
4. **阻塞式协作**
    
    线程必须等条件满足，**不能跳过、不能放弃**，必须执行。

==`tryLock()` = **尝试抢锁，抢不到立即放弃，直接走人，不等待！**==


