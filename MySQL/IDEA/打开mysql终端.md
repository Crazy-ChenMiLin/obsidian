1. 点击 IDEA 左下角的「Terminal」标签（和「问题」「控制台」在同一栏），打开终端窗口（这是 Windows 的 CMD 环境，不是 SQL 编辑器）
2. 先切到 `employees.sql` 所在的文件夹，输入命令（直接复制）：
    
    Cmd
    
    ```
    cd C:\Users\26487\Downloads\test_db-master\test_db-master
    ```
    
    回车，终端会显示这个路径，说明切对了。

### 步骤 2：登录 MySQL 命令行

1. 在终端输入（直接复制）：
    ``` mysql
   	 mysql -u root -p
    ```
    
1. 回车后会提示 `Enter password:`，输入你的 MySQL `root` 密码（输入时不会显示，输完直接回车即可）
2. 看到 `mysql>` 提示符，就说明成功登录 MySQL 了！