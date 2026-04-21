# 接口方法

接口
返回+==方法名==+==形参==
``` java
   
public interface IShopService extends IService<Shop> {  
  
    Result getById(Long id);  
  
}
```

# 实现类：

函数（==方法名==）{==形参==
具体逻辑
调用 Mapper
返回
}


```  java
    private final StringRedisTemplate stringRedisTemplate;  
  
  
    @Override  
    public Result sendCode(String phone, HttpSession session) {  
        //生成验证码  
        String code = RandomUtil.randomNumbers(6);  
        //发送验证码  
        log.info("发送验证码成功：验证码为：{}", code);  
  
        //保存验证码和手机号到redis  
        stringRedisTemplate.opsForValue().set
        (LOGIN_CODE_KEY+phone,code,LOGIN_CODE_TTL, TimeUnit.MINUTES);  
        return Result.ok("发送成功");  
    }
```