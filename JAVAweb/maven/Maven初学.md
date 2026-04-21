---
title: Maven 工程 与 依赖管理（详解）
tags: [Maven, 构建, 依赖管理, Java]
aliases: ["Maven 工程", "Maven 指南"]
---

本文为 Maven 使用与项目结构的详尽指南，面向希望把 Maven 用于日常 Java 开发与 CI/CD 的读者。内容覆盖目录规范、生命周期、常用命令、POM 核心元素、依赖传递与冲突处理、多模块（聚合/继承）、私服与实战建议。

## 一、为什么用 Maven

- 统一构建流程：约定优于配置（约定目录、生命周期、插件）。
- 依赖管理：自动解析传递依赖并从仓库下载。
- 跨项目复用：通过父 POM 管理版本与插件配置。

## 二、标准工程结构

标准目录（约定）：

- src/main/java — 应用源代码
- src/main/resources — 应用资源（配置文件、静态文件）
- src/test/java — 单元测试代码
- src/test/resources — 测试资源
- pom.xml — 描述与构建配置
- target/ — 构建输出（编译、打包产物）

遵循上述约定可以减少插件配置并提高互操作性。

## 三、生命周期（Lifecycle）与常用命令

主要内置生命周期：

- default（构建生命周期）：validate -> compile -> test -> package -> verify -> install -> deploy
- clean（清理 lifecycle）：pre-clean, clean, post-clean
- site（站点 lifecycle）：site, site-deploy

常用命令及说明：

- mvn clean — 删除 target/（清理构建产物）
- mvn compile — 编译主源码
- mvn test — 执行测试（surefire）
- mvn package — 打包（jar/war）
- mvn install — 将构件安装到本地仓库 (~/.m2/repository)
- mvn deploy — 上传构件到远程仓库（私服）
- mvn dependency:tree — 打印依赖树，帮助排查冲突

示例：在 CI 中常用命令

```bash
mvn clean install -DskipTests=true -Pprod
```

## 四、POM（Project Object Model）核心要素

主要元素：

- groupId / artifactId / version（GAV） — 唯一标识
- packaging — 打包类型（jar/war/pom）
- dependencies — 声明直接依赖!
- dependencyManagement — 父 POM 中管理版本
- build.plugins — 构建插件配置
- properties — 复用的变量（例如 Java 版本）
- profiles — 根据环境切换配置

示例（简化）：

```xml
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>app</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <properties>
    <java.version>11</java.version>
  </properties>
  <dependencies>
    <!-- 依赖列表 -->
  </dependencies>
  <build>
    <plugins>
      <!-- 插件 -->
    </plugins>
  </build>
</project>
```

## 五、依赖传递与冲突处理

当 A 依赖 B，B 依赖 C 时，A 会间接获得 C（传递依赖）。出现冲突时 Maven 按照“最近优先（nearest wins）”策略选择版本。

诊断与处理办法：

- mvn dependency:tree — 显示依赖树和版本冲突来源
- <exclusions> — 排除不需要的传递依赖
- dependencyManagement — 在父 POM 固定库版本，子模块引用不写 version
- scope — 控制依赖可见性（compile、provided、runtime、test、system）

示例：排除传递依赖

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
  <exclusions>
    <exclusion>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-tomcat</artifactId>
    </exclusion>
  </exclusions>
</dependency>
```

## 六、多模块工程（Inheritance 与 Aggregation）

两种常用模式：

- 继承（parent POM）：子模块通过 <parent> 引用父 POM，继承 dependencyManagement、pluginManagement、properties 等。
- 聚合（modules）：root POM 列出 <modules>，通过在 root 目录运行 mvn install 一次性构建所有模块。

实践建议：将“聚合器（aggregator）”与“共享父 POM（shared parent）”分离，避免循环依赖并提高复用性。

## 七、私服与仓库（Nexus / Artifactory）

工作流：

1) 本地仓库 (~/.m2/repository) 查找
2) 配置的远程仓库（公司私服）查找并缓存
3) 中央仓库或外部仓库

私服作用：内部构件托管、加速构建、缓存外部依赖、权限控制

在 settings.xml 中可以配置私服地址与认证信息（CI 使用安全凭据管理）。

## 八、常用插件与示例配置

- maven-compiler-plugin（编译选项）
- maven-surefire-plugin（单元测试）
- maven-failsafe-plugin（集成测试）
- maven-shade-plugin（打 uber-jar）
- maven-enforcer-plugin（强制规则，如依赖版本）

示例：编译插件设定 Java 版本

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-compiler-plugin</artifactId>
  <version>3.8.1</version>
  <configuration>
    <source>${java.version}</source>
    <target>${java.version}</target>
  </configuration>
</plugin>
```

## 九、CI/CD 与最佳实践

- 在 CI 环境中尽量避免 SNAPSHOT 作为唯一发布策略，明确 release 流程
- 不要将敏感凭证写入 pom.xml，使用 settings.xml 或 CI Secret 管理
- 使用 dependencyManagement 集中版本控制，避免模块间“版本漂移”
- 使用 mvn -T 并行构建（例如 mvn -T 1C）提升大模块工程的构建速度，但测试时需注意并发影响

## 十、排错技巧

- mvn -X 启用调试输出
- mvn dependency:tree -Dincludes=groupId:artifactId 精确定位冲突
- 使用 mvn help:effective-pom 查看合并后的最终 POM

## 十一、参考资料

- 官方： https://maven.apache.org/
- 工具：Maven Wrapper (mvnw) 推荐用于 CI 保持 Maven 版本一致
