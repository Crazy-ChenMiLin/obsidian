**Maven 构建过程中生成的所有「构建产物和中间文件」**

`target/` 目录。

### 具体会清除哪些内容（核心是 `target/` 下的所有文件）：

1. **编译产物（class 文件）**
    
    - `target/classes/`：存放项目源码（.java）编译后生成的 `.class` 字节码文件（这是你关注的核心）；
    - `target/test-classes/`：存放测试代码（如 JUnit 测试类）编译后的 `.class` 文件；
    - `target/[项目名]-[版本号].jar`/`.war`：打包生成的可执行 Jar 包、Web 应用 War 包等最终产物。
2. **构建中间文件 / 目录**
    
    - `target/resources/`：复制过来的资源文件（如 `src/main/resources` 下的配置文件、静态资源，构建时会复制到这里）；
    - `target/maven-status/`：Maven 构建过程的状态记录文件；
    - `target/surefire-reports/`：单元测试的执行报告（如测试通过率、失败日志）；
    - 其他临时文件：如编译缓存、插件生成的临时目录等。