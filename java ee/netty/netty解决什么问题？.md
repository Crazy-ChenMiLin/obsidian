# Why:
👉 **TCP 是** **无边界的字节流协议**

👉 **UDP 才是** **有边界的数据报协议**


# 有没有可能直接读取 bit 流？
## 字节流与 bit 流
``` java
public BitInputStream(String name) throws IOException {  
    stream = new ObjectInputStream(new FileInputStream(name));  
}
```
依赖于先 ObjectInputStream，先做整块读取，然后进行 bit 的拆包

```java
synchronized public int readBit() throws IOException {  
    if (!hasNext()) {  
       throw new IOException("流中没有剩余的比特位");  
    }  
    else {  
       nextBit--;  
       int bit = buffer & (1 << nextBit);  
       bit = (bit == 0) ? 0 : 1;  
       return bit;  
    }  
}
```
