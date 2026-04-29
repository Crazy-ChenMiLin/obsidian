# 一.发布笔记
```java
#### 实体类扩展（Blog.java）
@Data
@TableName("tb_blog")
public class Blog implements Serializable {
    private static final long serialVersionUID = 1L;
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    private Long shopId;
    private Long userId;
    private String title;
    private String images;
    private String content;
    private Integer liked;
    private Integer comments;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    // 非数据库字段：用于前端展示发布人信息
    @TableField(exist = false)
    private String name; // 发布人昵称
    @TableField(exist = false)
    private String icon; // 发布人头像
    @TableField(exist = false)
    private Boolean isLike; // 当前用户是否点赞过该笔记
}

#### Controller 层（BlogController.java）
@RestController
@RequestMapping("/blog")
public class BlogController {
    @Resource
    private IBlogService blogService;

    // 发布探店笔记
    @PostMapping
    public Result saveBlog(@RequestBody Blog blog) {
        return blogService.saveBlog(blog);
    }
}
#### Service 层实现（BlogServiceImpl.java）
@Service
public class BlogServiceImpl extends ServiceImpl<BlogMapper, Blog> implements IBlogService {
    @Override
    public Result saveBlog(Blog blog) {
        // 1. 获取登录用户
        UserDTO user = UserHolder.getUser();
        blog.setUserId(user.getId());
        // 2. 保存探店笔记
        boolean isSuccess = save(blog);
        if(!isSuccess){
            return Result.fail("发布笔记失败");
        }
        // 3. 返回笔记id
        return Result.ok(blog.getId());
    }
}
```
总结为 1 点
	保存实体类(blog)的全部信息
# 二.查看博客文章
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



# 三. Set代码功能总结为 4 点
	前端：观看者的页面展示的爱心呈现与否
	观看者对于文章是否已经点过爱心
	文章收集来自不同观看者的总爱心数量
	采用set集合，进高并发场景，快速判断用户是否已经点过赞，减少查询点赞表的数据库读操作。（但是点赞还是直接访问的了数据库）

```java
@Resource
private StringRedisTemplate stringRedisTemplate;

@Override
public Result likeBlog(Long id) {
    // 1. 获取当前登录用户
    Long userId = UserHolder.getUser().getId();
    // 2. 定义Redis的key
    String key = "blog:liked:" + id;
    // 3. 判断用户是否已经点赞（Set的isMember命令）
    Boolean isLiked = stringRedisTemplate.opsForSet().isMember(key, userId.toString());
    if (BooleanUtil.isFalse(isLiked)) {
        // 4. 未点赞：执行点赞逻辑
        // 4.1 数据库点赞数+1
        boolean isSuccess = update().setSql("liked = liked + 1").eq("id", id).update();
        if (isSuccess) {
            // 4.2 把用户ID存入Redis的Set集合
            stringRedisTemplate.opsForSet().add(key, userId.toString());
        }
    } else {
        // 5. 已点赞：执行取消点赞逻辑
        // 5.1 数据库点赞数-1
        boolean isSuccess = update().setSql("liked = liked - 1").eq("id", id).update();
        if (isSuccess) {
            // 5.2 把用户ID从Redis的Set集合中移除
            stringRedisTemplate.opsForSet().remove(key, userId.toString());
        }
    }
    return Result.ok();
}
```


