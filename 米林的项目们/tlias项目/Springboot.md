
## 二、SpringBoot快速入门

#### 2.1.2 添加SpringBoot的起步依赖
SpringBoot的起步依赖spring-boot-starter-parent
相关依赖：
web的启动依赖
Mybatis 依赖
Mysql 依赖
#### 2.1.3 编写SpringBoot引导类
要通过SpringBoot提供的引导类起步SpringBoot才可以进行访问
即关于配置

父类
启动注解@SpringBootApplication
混合注解：
- `@SpringBootConfiguration`：定义容器  本质是 `@Configuration`，标识这个类是配置类，
- `@ComponentScan`：
自动扫描 `@Component` 定义 bean对象
（包括 `@Service`、`@Controller` 等派生注解）的类，将它们注册为 Spring 容器中的 Bean。
- `@EnableAutoConfiguration`：**核心中的核心**，开启自动配置功能（这也是和传统 Spring 最大的区别）。 **Spring Boot 根据类路径（编译后的 class 文件）和注解自动识别并加载需要的配置。**




