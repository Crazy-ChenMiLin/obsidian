先打包（打包的前提）

有 package. Json
有 
![[Pasted image 20251119112757.png]]


# 检查 Node 和 npm 是否安装（Windows）  
node -v  
npm -v  
  
# 进入前端项目目录（根据实际改）  
cd web  
# 或 cd vue-wxdemo  
  
# 检查是否有 package.json 和 node_modules  
dir package.json  
dir node_modules  
![[Pasted image 20251118191830.png]]
  
# 列出已安装的顶层依赖（如果安装过）  
npm ls --depth=0  
![[Pasted image 20251118191948.png]]
  
# 如果没有安装依赖，运行安装  
npm install->npm run dev
