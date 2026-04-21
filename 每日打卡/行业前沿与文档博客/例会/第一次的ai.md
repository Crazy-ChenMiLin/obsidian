Langchain 4 j
	AI 实例化对象：AI Services


感觉：
	熟悉 java 调用 ai api 的方式，打个基础-后面做一个 ai agent的项目
	了解一下简单大模型的一些原理


核心：
	基于接口的 动态代理工厂模式




### 功能展示如下：只写了接口，前端没有写

一.会话记忆
	

二.Rag：
	原理：
		本地知识库 or 其他数据库：
		文档切割+部分上下文重叠=知识
		知识转向量
		![[Pasted image 20260103202025.png]]
		
	
改进：
Todo 增强版：
- [ ] 分知识库：
- [ ] 修改内存向量存储：mongdb/ [所有支持的嵌入存储比较表 | LangChain4j 中文文档](https://docs.langchain4j.info/integrations/embedding-stores/)



三,Mcp 库：
		本地库
		网络 http 请求库：

	举例：网络 http 请求库
		质谱大模型的搜索功能
		还有其他的mcp服务。比如小红书搜索。可以用来自动获取信息然后发博客
		
	三步走

四.Jsoup 简单爬虫

	提示词（关键词）
	
	提取用户输入关键词+网址uml
	使用工具+发送请求
	返回css选择器

流式输出
	Flux  or TokenStream
	Flux 引用数据类型。导包
	


其他没有做的：
	情感回答
	