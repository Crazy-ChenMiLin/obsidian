# 死循环的核心
是循环条件永远为 true，导致代码块无限执行。以下是 3 种最常见的形式：
 
## 1.  For 循环死循环：省略初始化、条件判断和迭代语句，或让条件恒为 true


// 形式 1：所有表达式省略
For (;;) {
    System. Out. Println ("for 死循环");
}
// 形式 2：条件恒为 true
For (int i = 0; i == 0; ) { // i 始终为 0，条件永远成立
    System. Out. Println ("for 死循环 2");
}
<hr>

### 2.  While 循环死循环：直接将循环条件设为 true （最直观的死循环）


While (true) {
    System. Out. Println ("while 死循环");
    // 若没有 break 语句，将无限执行
}
![[Pasted image 20260131102001.png]]
 
### 3.  Do-while (true) 循环死循环：先执行一次循环体，再判断条件（条件恒为 true）
Do {
    System. Out. Println ("do-while 死循环");
} while (true); // 条件永远为 true，执行后无限循环



### 3.  Do-while (false) 与 为什么不直接写 do 里面的代码，也是只执行一次？
What:
无论条件是否成立，循环体至少会执行一次

Why:
1. 优势一：解决循环嵌套
	循环嵌套：
``` c
#include <stdio.h>

int main() {
    int divisor = 0;
    int num = -5;

    // 直接写代码：校验失败后，只能用if嵌套，层数越多越乱
    if (divisor != 0) { // 第一层校验
        if (num >= 0) { // 第二层校验
            printf("计算结果：%d\n", num / divisor); // 核心逻辑
        } else {
            printf("错误：被除数不能为负\n");
        }
    } else {
        printf("错误：除数不能为0\n");
    }

    printf("程序继续执行...\n");
    return 0;
}
```

``` c
#include <stdio.h>

int main() {
    int divisor = 0;
    int num = -5;

    // do while(false)：校验失败直接break，逻辑扁平化
    do {
        if (divisor == 0) {
            printf("错误：除数不能为0\n");
            break; // 直接跳出这段代码，不执行后续校验和核心逻辑
        }
        if (num < 0) {
            printf("错误：被除数不能为负\n");
            break;
        }
        // 所有校验通过才执行核心逻辑
        printf("计算结果：%d\n", num / divisor);
    } while (false);

    printf("程序继续执行...\n");
    return 0;
}
```

<hr>

2. 优势二：隔离变量作用域（直接写代码会污染外部）
``` c
public class Test {
    public static void main(String[] args) {
        int a = 10; // 外部变量
        
        // 直接写代码：这里定义的a会和外部冲突，编译报错
        int a = 20; 
        System.out.println(a);
    }
}
```

``` c
public class Test {
    public static void main(String[] args) {
        int a = 10; // 外部变量
        
        do {
            int a = 20; // 内部作用域，和外部a互不干扰
            System.out.println("内部a：" + a); // 输出20
        } while (false);
        
        System.out.println("外部a：" + a); // 输出10
    }
}
```