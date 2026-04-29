# 一.查看博客文章
```
// 抽取公共方法：填充笔记的发布人信息
private void queryBlogUser(Blog blog) {
    Long userId = blog.getUserId();
    User user = userService.getById(userId);
    blog.setName(user.getNickName());
    blog.setIcon(user.getIcon());
}
```

## 1.queryBlogById
```java
@Override
public Result queryBlogById(Long id) {
// 1. 查询笔记
Blog blog = getById(id);
if (blog == null) {
    return Result.fail("笔记不存在");
}
// 2. 查询并填充发布用户信息
queryBlogUser(blog);
return Result.ok(blog);
}
```

总结为 2 点
	查询笔记的内容
	查询发布者的信息
	（set 查询是否观看者已经点过赞）

## 2.QueryHotBlog
```java
@Override
public Result queryHotBlog(Integer current) {
    // 1. 分页查询，按点赞数倒序（也可按创建时间）
    Page<Blog> page = query()
            .orderByDesc("liked")
            .page(new Page<>(current, SystemConstants.MAX_PAGE_SIZE));
    // 2. 获取当前页数据
    List<Blog> records = page.getRecords();
    // 3. 循环填充用户信息
    records.forEach(this::queryBlogUser);
    return Result.ok(records);
}
```
总结为 3 点
	分页查询
	点赞排序
	查询展示



# 二. Set代码功能总结为 4 点
	前端：观看者的页面展示的爱心呈现与否
	观看者对于文章是否已经点过爱心
	文章收集来自不同观看者的总爱心数量
	采用set集合，进高并发场景，快速判断用户是否已经点过赞，减少查询点赞表的数据库读操作。（但是点赞还是直接访问的了数据库）

