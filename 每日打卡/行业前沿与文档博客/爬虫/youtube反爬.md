# 前言：

爬虫执行 JS（deno）场景：网页的核心数据是 JS 动态渲染的（比如 Ajax 加载、Vue/React 动态生成），爬虫只爬静态 HTML 拿不到数据，必须执行网页的 JS（用 deno/Pyppeteer 等），最终要么拿到渲染后的完整数据，要么拿不到（JS 执行失败）
![[Pasted image 20260308183122.png]]



![[Pasted image 20260308183232.png]]
1.![[Pasted image 20260308215319.png]]


2. 粘贴为 txt:

![[Pasted image 20260308215402.png]]

3. 配置一下

![[Pasted image 20260308215438.png]]
# 成功：


![[Pasted image 20260308215240.png]]

# But: 第一次见
Js  n 挑战
![[Pasted image 20260308220028.png]]

简单来说，这个反爬策略的核心就是 “让只有能正常执行我最新 JS 的客户端，才能拿到视频地址”，而你的问题是执行 JS 的环节（deno）掉链子了。

#### 2. 关键细节拆解

- **核心：混淆的 “n 函数”**
    
    YouTube 会把视频播放地址的核心验证参数（叫`signature`，签名）通过一段**高度混淆的 JavaScript 代码**保护起来，这段代码里的核心逻辑就是 “n 函数”。
    
    真人浏览器会自动执行这段 JS，算出有效的签名；
    而 yt-dlp 这类 Python 工具本身无法执行 JS，必须依赖外部的 `deno` / `node.js` 这类外部 JS 运行时来模拟执行。
    
- **为什么会 “found 0 n function possibilities”？**
    
    这是因为 YouTube 近期更新了 JS 混淆方式（比如改了 n 函数的变量名、嵌套结构、加密逻辑），
    你的 yt-dlp 版本或 deno 运行时没能识别出新的 n 函数结构，导致 “找不到可执行的 n 函数”
    —— 签名计算失败，
    自然拿不到真实的视频格式，最终报错 “Requested format is not available”。
    
- **策略的 “进阶防护”**
    
    除了混淆 JS，这个反爬策略还包含：
    
    ✅ 环境检测：JS 会检测运行环境（比如是否是真实浏览器的 V8 引擎），deno/node 这类非浏览器环境容易被识别，导致执行失败；
    
    ✅ 动态更新：YouTube 会频繁修改 n 函数的混淆规则，让爬虫工具的适配永远 “慢一步”；
    
    ✅ 签名时效性：就算算出了签名，也只有短时间内有效，进一步增加爬虫难度。
    
# 什么是 deno?

#### 1. Node.js（✅ 最推荐替代 deno 的工具）

- **核心定位**：和 deno 同属「JavaScript/TypeScript 独立运行时」，是目前最主流、生态最完善的 JS 执行工具（deno 就是 Node.js 创始人重新设计的替代品）。
- **核心特点**：
    
    - 兼容性极强，yt-dlp 对 Node.js 的适配远好于 deno；
    - 安装简单，跨平台（Windows/macOS/Linux）；
    - 能稳定执行 YouTube 混淆的 JS 代码，解决 “n 挑战” 问题。
    
- **为什么适合你的场景**：之前 deno 执行失败，换成 Node.js 是解决 yt-dlp 中 JS 挑战最直接的方案，几乎能规避 90% 的 “JS 执行失败” 报错。

#### 2. Bun（🚀 新兴高性能工具）

- **核心定位**：新一代 JS/TS 运行时，兼容 Node.js 生态，执行速度比 Node.js/deno 更快。
- **核心特点**：
    - 体积小、启动快，对混淆 JS 的解析效率更高；
    - 内置包管理、转译等功能，无需额外配置；
    - yt-dlp 最新版本已适配 Bun，可作为 Node.js 的替代。



![[Pasted image 20260308221356.png]]