Deprecated 废弃的

IDEA 是**完全支持独立使用 Java 17**的，编译出问题是因为**多个配置环节没同步到位**（终端、项目 SDK、Maven 编译插件等环节的 Java 版本不一致）。以下是具体原因和解决步骤：
### 问题核心

IDEA 中 Java 版本的生效是**多环节协同的**，只改 `Project Structure` 和 `pom.xml` 还不够 —— 终端的 Java 版本、Maven 编译插件、IDEA 内置编译器等环节都可能还停留在 Java 8，导致版本不兼容。

### 解决步骤（按顺序检查）

#### 1. 确认「Project Structure」的所有 SDK 都设为 Java 17

- 打开 `File → Project Structure`：
    - **Project 标签**：确保「Project SDK」选择的是 Java 17（如果列表里没有，点击「Add SDK」手动添加 Java 17 的安装路径）；
    - **Modules 标签**：选中你的模块，在「Dependencies」里确保「Module SDK」和 Project SDK 一致（选 Java 17）。

#### 2. 确保 `pom.xml` 中 Maven 编译插件明确指定 Java 17

仅改 `java.version` 可能不够，需要强制 Maven 编译插件用 17（避免插件默认用 Java 8）：

Xml

```xml
<properties>
    <!-- 先指定 Java 版本 -->
    <java.version>17</java.version>
    <maven.compiler.source>${java.version}</maven.compiler.source>
    <maven.compiler.target>${java.version}</maven.compiler.target>
</properties>

<build>
    <plugins>
        <!-- 强制 Maven 编译插件用 Java 17 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.8.1</version> <!-- 用较新的插件版本支持 17 -->
            <configuration>
                <source>${java.version}</source>
                <target>${java.version}</target>
                <encoding>UTF-8</encoding>
            </configuration>
        </plugin>
    </plugins>
</build>
```

改完后，右键 `pom.xml → Maven → Reload Project`，让配置生效。

#### 3. 检查 IDEA 内置「Java Compiler」的版本

IDEA 自己的编译器版本也需要匹配 Java 17：

- 打开 `File → Settings → Build, Execution, Deployment → Compiler → Java Compiler`；
- 确保「Project bytecode version」选择「17」；
- 下方「Module」列表中，每个模块的「Target bytecode version」也设为 17。

#### 4. 修正 IDEA 终端的 Java 版本

终端显示 Java 8，是因为**IDEA 终端默认继承了系统的 Java 环境变量**，需要让终端单独用 Java 17：

- 打开 `File → Settings → Tools → Terminal`；
- 在「Environment variables」中，添加 / 修改 `JAVA_HOME` 为你的 Java 17 安装路径（比如 Windows 是 `C:\Program Files\Java\jdk-17.x.x`，Mac/Linux 是 `/usr/lib/jvm/java-17-openjdk`）；
- 重启 IDEA 终端（关闭当前终端标签，重新打开），然后输入 `java -version`，应该显示 17 了。

#### 5. 最后：重启 IDEA + 清除缓存

配置改完后，重启 IDEA 并清除缓存（避免旧配置残留）：

- 点击 `File → Invalidate Caches / Restart → Invalidate and Restart`。

完成以上步骤后，IDEA 会完全使用 Java 17 编译、运行项目，终端也会显示 Java 17，编译问题就解决了～

要不要我帮你整理一份「IDEA 统一 Java 版本的配置清单」，方便你之后快速核对？