


1. 改 git 地址
		git remote set-url origin（分支） 仓库地址
		git remote -v
		https://github.com/hhhhabby/word_app.git
![[Pasted image 20260416224132.png]]


2. 成功标志：
![[Pasted image 20260302133925.png]]

3. 启动项目
	1. 环境
![[Pasted image 20260302134313.png]]
	Build 项目
4. Sdk 环境
![[Pasted image 20260302222759.png]]

配置环境

构建项目

打包 app


# 指令提交
#### . 先提交本地修改

在当前终端（已激活 `venv` 环境）执行：

```
# 1. 查看当前文件修改状态
git status

# 2. 暂存所有修改（也可以指定单个文件，比如 git add app.py）
git add .

# 3. 提交修改并写备注
git commit -m "1. 增加任务隔离退出，不再继续后续流程"
```

#### 2. 推送到远程仓库

执行推送命令：

```
# 首次推送该分支时，加上 -u 绑定上游分支，之后可直接用 git push
git push -u origin master

# 非首次推送，直接执行：
git push
```
