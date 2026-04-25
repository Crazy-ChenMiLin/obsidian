# 锁在循环里：每次循环，都会【释放锁 → 重新竞争锁】
``` java
public class MyTread extends Thread{  
    static int ticket=0;  
    static Object lock=new Object();  
    @Override  
    public void run(){  
        while(true){  
        // 锁在循环里：每次循环，都会【释放锁 → 重新竞争锁】
            synchronized(lock){  
                if(ticket<100){  
                    try {  
                        Thread.sleep(10);  
                    } catch (InterruptedException e) {  
                        throw new RuntimeException(e);  
                    }  
                    ticket++;  
                    System.out.println(("正在买第"+ticket+"张票"));  
                }else{  
                    break;  
                    }  }  }  }  }
```

