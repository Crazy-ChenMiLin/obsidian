https://blog.csdn.net/m0_46193073/article/details/104257123
#  spring mvc 参数传递的方式有哪些？
一、前端向后台传递参数的方式：
通过 Servlet api 中的 HttpServletRequest 对象
基本数据类型 + String 类型
Array 数组
Java Bean 对象
List 集合
Map 集合
JSON 格式



二、后台向前端通过 request 域传递值的方式：
Servlet api 中的 HttpServletRequest 对象
ModelAndView 对象
ModelMap 对象
Model 对象
Map 集合