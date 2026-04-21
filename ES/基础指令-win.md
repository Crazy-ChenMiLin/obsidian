删除旧的
```
Docker rm -f es

```
# 1. 安装特定版本

```
docker pull docker.elastic.co/elasticsearch/elasticsearch:9.2.1
```

# 2. 启动进程
```
docker run -d --name es -p 9200:9200 -p 9300:9300 ^
-e "discovery.type=single-node" ^
-e "xpack.security.enabled=false" ^
-e "xpack.security.http.ssl.enabled=false" ^
docker.elastic.co/elasticsearch/elasticsearch:9.2.1
```

# 3. 浏览器验证安装是否成功
http://localhost:9200

![[Pasted image 20260406212726.png]]