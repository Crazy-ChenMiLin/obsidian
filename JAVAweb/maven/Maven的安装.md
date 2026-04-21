1. **解压 Maven**：
    把 zip 包解压到**无中文、无空格**的目录（比如 `D:\Maven\apache-maven-3.9.11`，必须是 “具体版本目录”）


1. **配置环境变量**：
    - 新增系统变量 `MAVEN_HOME`：
变量值填 Maven 的具体版本目录（如 `D:\Maven\apache-maven-3.9.11`）；
    - 编辑系统变量 `Path`：
新增一条 `%MAVEN_HOME%\bin`；


2. **验证配置**：
    
    重启终端（CMD/PowerShell），输入 `mvn -v`，能显示 Maven 版本信息即成功。