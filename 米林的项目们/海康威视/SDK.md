很多人会把**SDK**和**API**搞混，简单说：**API 是 SDK 里的「单个工具」**
（比如 `MV_CC_Initialize()` 这个函数就是一个 API）

**SDK 是「所有工具 + 说明书 + 配件的完整包」**
因此把 SDK 理解成“仅仅一组 Java 方法”是不够的——更准确的是“API + 一个本地运行时环境”。当你调用 MV_CC_Initialize () 时，通常会启动并分配这些全局本地资源；而 MV_CC_Finalize () 则会释放这些全局资源。