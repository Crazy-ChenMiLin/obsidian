
**结构（记忆关键词：盒子—输入—提示—按钮）**
- 页面主体有一个登录层 `.login`，内含 `.login-box`（登录框）。
- 登录框包含：账号输入（`.account-input`）、密码输入（`.password-input`）、错误提示（`.account-tip`, `.password-tip`）和登录按钮（`.login-button`）。
- 其余页面主界面放在 `.imformation-management`，初始隐藏（登录成功后显示）。

**样式（记忆关键词：可见性与样式切换）**
- 用 `.cover` 做遮罩（覆盖层），显示/隐藏用 `display` 控制。
- 输入框默认边框和获得焦点样式在 `style.css` 中定义；错误时用 JS 改变边框颜色和提示的 `visibility`。
- 登录框定位通过绝对定位与 transform 居中显示。

**JS 逻辑（记忆关键词：取元素 → 验证 → 切换页面）**
- 关键 DOM 选择：
  - `const account = document.querySelector(".account-input")`
  - `const password = document.querySelector(".password-input")`
  - `const accounttip = document.querySelector(".account-tip")`
  - `const passwordtip = document.querySelector(".password-tip")`
  - `const loginButton = document.querySelector(".login-button")`
  - `const login = document.querySelector(".login")`
  - `const headPage = document.querySelector(".imformation-management")`
- 登录校验入口：`loginButton.addEventListener('click', formCheck)`，函数 `formCheck()`：
  1. 检查账号非空；若空 => 显示 `accounttip` 并把输入框边框设红。
  2. 检查密码是否等于 `master.password`（初始值来自 localStorage 的 `masterPassword`，默认 `"12345678dt@"`）。
  3. 如果都通过（flag 为 true），把登录层隐藏（`login.style.display = "none"`），并显示主界面（`homePage`、`headPage` 等）。
- 管理管理员密码：`masterPassword` 存/取自 `localStorage`（键 `"masterPassword"`），修改密码时更新并存回 localStorage。
- 其他相关功能（与登录显示切换相关）：
  - 退出登录：点击 `.exit` 会把登录层显示回去并隐藏主界面。
  - 页面之间切换（首页、邮件、账户管理）通过设置对应容器的 `style.display` 实现。

**持久化与数据**
- 管理员密码：`localStorage.getItem('masterPassword')` 与 `localStorage.setItem('masterPassword', ...)`
- 用户列表：保存在 `localStorage` 键 `users`。
- 邮件信息：保存在 `localStorage` 键 `EmailImformations`。

**快速记忆清单（4 步）**
1. 结构：`.login` → `.login-box` → 输入 + 提示 + 按钮。  
2. 样式：CSS 控制布局与输入焦点/错误样式（红边 + 提示可见）。  
3. 行为：JS 做三件事：选元素 → 验证（账号非空、密码比对）→ 切换显示（登录隐藏，主界面显示）。  
4. 持久化：`masterPassword` 和 `users` 存在 `localStorage`。

如果你想，我可以：
- 用注释标注 `html.html`、`script.js` 的关键行（方便记忆），或
- 做一张小抄格式的单页 README，便于背诵。要哪种？





# User: js 的基本语法是什么？

**核心概念**
- **变量**: `var`（函数作用域，老）、`let`（块级作用域，推荐）、`const`（常量，引用不可变）。
- **数据类型**: 数字、字符串、布尔、`null`、`undefined`、对象（`{}`）、数组（`[]`）、`Symbol`。
- **运算与比较**: 算术 `+ - * / %`，逻辑 `&& || !`，比较 `==`（类型转换） vs `===`（严格相等，推荐）。

**流程控制**
  - `for...of`（遍历数组元素），`for...in`（遍历对象/索引）

**函数**
- 声明: `function fn(a,b){ return a+b }`
- 表达式: `const fn = function(a){ }`
- 箭头函数: `const fn = (a,b) => a+b`（注意 `this` 行为不同）。

**对象与数组**
- 对象字面量: `const obj = {name:'a', age:18}`
- 访问: `obj.name` 或 `obj['name']`
- 数组方法: `push、pop、map、filter、forEach、find`。

**字符串与模板**
- 模板字符串: `` `Hello ${name}` ``，便于拼接。

**解构与展开**
- 解构对象/数组: `const {a,b} = obj` / `const [x,y]=arr`
- 展开操作符: `...`（复制/合并/rest 参数）。

**DOM 与事件（你代码里大量使用）**
- 选元素: `document.querySelector('.class')`，`querySelectorAll` 返回节点列表。
- 改属性/内容: `el.style.display = 'none'`，`el.value`，`el.innerHTML`。
- 事件监听: `el.addEventListener('click', handler)`。
- 创建节点: `document.createElement('div')` + `parent.appendChild(node)`。

**浏览器存储**
- `localStorage.setItem('key', JSON.stringify(obj))`
- `const obj = JSON.parse(localStorage.getItem('key'))`

**异步**
- Promise: `new Promise((res,rej)=>{})`，链式 `.then().catch()`。
- async/await: `async function f(){ const r = await p }`，更直观的异步写法。

**错误与调试**
- 错误处理: `try { ... } catch(e) { ... } finally { ... }`
- 调试: `console.log(...)`、`console.error(...)`、`debugger`。

**正则与表单验证**
- 常用方式：`/regex/.test(str)`，例子：密码格式验证在你脚本中用到的正则：  
  ` /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/ `

**常见陷阱（快速记忆）**
- `==` 会做类型转换，优先用 `===`。  
- `let` / `const` 有块级作用域，避免用 `var` 导致提升问题。  
- DOM 操作要等 DOM 加载完（把脚本放在 `</body>` 或用 `DOMContentLoaded`）。  
- 修改 `localStorage` 前后要 `JSON.stringify` / `JSON.parse` 保持对象结构。

**与当前项目相关的简短示例（记忆卡）**
- 选取输入并验证（简化版）：
  - `const account = document.querySelector('.account-input')`
  - `const password = document.querySelector('.password-input')`
  - `loginButton.addEventListener('click', () => { if (!account.value) { /* 显示提示 */ } if (password.value === masterPassword) { /* 登录 */ } })`

如果你想要：
- **小抄版 PDF/单页 README**（便于背诵），或
- 在 script. Js 上加行内注释（只读版，不修改源码），

告诉我你要哪一个，我来生成（不会改原文件，按你要求）。