![[Pasted image 20251222210911.png]] 

1. **异常类型**：`NoSuchBeanDefinitionException` →
容器里没有 `ChatModel` 类型的 Bean
而非注解本身错误）

2. Expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {@jakarta.Annotation.Resource (shareable=true, lookup="", name="", description="", authe



3. **ChatModel Bean 的创建逻辑**：
`ChatModel` 不是你自定义的 Bean，而是 LangChain4j Starter 的自动配置类（`DashScopeAutoConfiguration`）创建的；

4. `langchain4j` 嵌套在 `spring:` 下，导致 Spring 解析出的配置键是 `spring.langchain4j.community.dashscope.api-key` → 自动配置类的条件不满足，因此**完全没有创建 ChatModel Bean**；