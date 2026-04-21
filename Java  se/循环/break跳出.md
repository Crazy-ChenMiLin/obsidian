## 五. Break 语句

Public class Test {
   Public static void main (String[] args) {
      Int [] numbers = {10, 20, 30, 40, 50};
 
      for(int x : numbers ) {
         // x 等于 30 时跳出循环
         if( x == 30 ) {
            break;
         }
         System.out.print( x );
         System.out.print("\n");
      }
   }
}

#### （3）while if else

某些场景下，“无限循环 + if+break” 比 “复杂的 while 条件” 更易读。

**例子：等待用户输入正确的密码**

```java
import java.util.Scanner;

public class InputPassword {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String correctPwd = "123456";
        
        
        
        // 无限循环（while(true)），用if+break控制              退出
        while (true) { 
            System.out.print("请输入密码：");
            String input = sc.nextLine();
            if (correctPwd.equals(input)) { 
                System.out.println("密码正确，登录成功");
                // 条件满足时退出
                break;
            } else {
                System.out.println("密码错误，请重试");
            }
        }
        sc.close();
    }
}
```

