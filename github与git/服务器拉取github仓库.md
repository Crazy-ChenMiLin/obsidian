# 启迪项目

```
# 1. 进入你的项目目录（比如 /opt/word_app）
cd /opt/word_app

# 2. 激活虚拟环境（如果之前创建了）
source venv/bin/activate

# 3. 拉取 GitHub 上的最新代码（当前分支是 master 就拉 master）
git pull origin master

#### 1. 杀死旧进程（关键！）

# 1. 先查所有运行app.py的进程（确认旧PID是否还在）
ps -ef | grep app.py | grep -v grep

# 2. 杀死旧进程（替换成你查到的旧PID，比如1106099） 
kill -9 1106099


# 4. 重启服务（代码更新后必须重启才能生效）
生产用（后台启动，关闭终端后服务仍运行）：


nohup python app.py > output.log 2>&1 &



# 方式1：如果是测试运行的 python app.py，先关闭旧进程（Ctrl+C），再重新运行
# 方式2：如果是 gunicorn 后台运行，先杀进程再重启
pkill gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app --daemon



```


