# 一. For 循环
`for` 循环负责**重复遍历**（比如遍历数组、集合中的元素），`if` 语句负责在遍历过程中**筛选条件**，两者结合可以实现 “有条件地处理循环中的元素”。
For (遍历集合中的每个元素) 
{ if (元素满足某个条件) { 执行针对该元素的操作; } }
<Hr>
# 二. Foreach 循环/增强 for 循环
**格式：**
```java
for (元素类型 变量名 : 容器) {
    // 循环体：使用变量名访问当前元素
}
```
**Eg:**
```java
String[] names = {"张三", "李四", "王五"};
for (String name : names) {
    System.out.println("姓名：" + name);
}
```
**适用范围：**
容器里面是元素的长度，不会改变
不能获取索引，只能遍历
*想要修改特定元素还是只能是 for 循环*
### 特殊情况：集合为空时选择跳过
``` java
for (MV_CC_DEVICE_INFO stDeviceInfo : deviceList) {  
    if (stDeviceInfo == null) {  
        continue;  
    }  
    log.info("[摄像头 {}]", i);  
    printDeviceInfo(stDeviceInfo);  
    i++;  
}
```
# 三. 循环嵌套




# 三. 循环嵌套