### 一、null 和 "" 的核心区别

| 特性         | null（空对象）                        | ""（空字符串）                  |
| ---------- | -------------------------------- | ------------------------- |
| 本质         | 没有指向任何对象（内存中无地址）                 | 是一个**真实存在的字符串对象**，长度为 0   |
| 占用内存       | 不占用对象内存（仅存一个 “空引用”）              | 占用字符串对象的基础内存（少量）          |
| 调用方法 / 属性  | 会报 `NullPointerException`（空指针异常） | 可正常调用字符串方法（如 `isEmpty()`） |
| 实际场景（你的项目） | 1. 数据库字段未赋值；                     |                           |
|            |                                  |                           |
|            |                                  |                           |
### 二、解决方法

#### 1 . 解决空指针
```java
// 例：判断前端传的商品名称是否为空
if (StringUtils.isEmpty(goods.getName())) {
    return Result.error("商品名称不能为空");
// str 是 null 或 "" 时返回 true
}


// 2. 判断是否为 null/"" 或纯空格（更严格，比如用户只输了空格）
if (StringUtils.isBlank(str)) {
    return Result.error("商品名称不能为空");
}
// str 是 null/"" 或 "   " 时返回 true



**反向方法**：
if (StringUtils.isNotBlank(goods.getName())) {
    // 商品名称有效，执行后续逻辑
}
```

#### 2. 常用比较方法（项目高频）

| 方法                             | 作用                       | 示例（你的项目）                                       |
| ------------------------------ | ------------------------ | ---------------------------------------------- |
| `equals(String str)`           | 严格比较内容（区分大小写、空格）         | 校验用户名：`"admin".equals(userName)`               |
| `equalsIgnoreCase(String str)` | 忽略大小写比较内容（常用）            | 搜索商品（忽略大小写）：`"手机".equalsIgnoreCase(goodsName)` |
| `contains(String str)`         | 判断 A 字符串是否包含 B 字符串（模糊匹配） | 搜索商品关键词：`goods.getName().contains("华为")`       |
