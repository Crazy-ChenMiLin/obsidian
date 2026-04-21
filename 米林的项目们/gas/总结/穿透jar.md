# ClassPathResource 和 getResourceAsStream

1. **核心差异**：
    - `getClass().getResourceAsStream()`：JDK 原生，仅返回输入流，路径有坑（带`/`是根路径、不带是当前类包路径），资源不存在返回`null`，无额外功能；
    - `ClassPathResource`：Spring 封装，功能全（判资源存在、拿 URL、指定类加载器等），路径更友好（`/`可省），资源不存在抛明确异常，适配 Spring 生态（@Value、ResourceLoader 等）；
2. **使用选择**：纯 JDK 环境用前者（注意判空 + 路径），Spring 环境优先用后者。

SystemMessage(fromResource = "system.txt")  
    String chat(String userMessage);
![[Pasted image 20251227121058.png]]


3.
![[Pasted image 20260103140702.png]]