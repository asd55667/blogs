<!--
updated: 2020年7月28日 23:00
tags: [programming language, java, book]
-->

# Java核心技术卷I：基础知识（第10版）

> 秋招迷茫时稍微看了一丁点, 知乎大佬的推荐

再次感受下纯粹的OOP，Java的魅力

## 1. 概述

### 1.2 本书涉及的关键字
简单性、OOP、分布式、健壮性、安全性、
体系结构中立、可移植性、解释性、高能性、多线程、动态性

Java、C#属于同层级的语言，简化C++的同时，尽可能保留效率

Java的OOP不差于C++， 无多重继承， 接口为之取代品，拥有更丰富的运行时自省功能

分布式大数据也是Java的天下， 基于Java的语言Scala， Hadoop

国内大厂的Java生态，稳定、性能得以充分验证

虚拟机保证其可移植性可靠性

Java多线程也是纯正的，能充分利用cpu

## 3.  Java的基本设计结构
### Java简介
`java`程序主程序类名需与文件名一致， `java`文件只允许一个`public`修饰符的主类， `main`方法也必须是`pulic`的

`java`的整型范围与机器无关，可见其优良的移植性， `java`编译器会去掉下划线分隔的数字的下划线

`float` 4个字节 `double` 8个字节， 特殊浮点数值 `inf`、`-inf`、`NaN`

在`mac`上`java`的默认编码是`utf8`, 其他平台跟用户设定的区域一致

`final`关键字表示变量只能被赋值一次， 类似`const`

`java`在兼顾移植性的同时， 是有消耗了性能与精度的，要保留精度可以加上关键字`strictfp`到方法中

#### StringBuilder
一般字符串都是`const`，对小段字符串组合拼接是低效的，`StringBuild`是经`StringBuffer`优化的单线程类

#### 标准IO
捕获标准输入需要`Scanner`对象，
`Scanner in = new Scanner(System.in);`
行解析方法`nextLine`
`String line = in.nextLine();`

格式化输出与`c`的`printf`类似

#### 文件IO
文件输入
`Scanner in = new Scanner(Paths.get("niyflle.txt"), "UTF-8");`
文件输出
`PrintWriter out = new PrintlulriterC'myfile.txt", "UTF-8");`

#### 大数值
针对精度要求较高的场景而提供的类
`BigInteger` 、 `BigDecimal` 可以在`math`包中找到

## 4. OOP, 对象和类
### 4.1 OOP概述
上世纪`70`年代主流程序设计还是结构化编程，其组成为`算法`+`数据结构`=`程序`
`OOP`调换组成顺序，将数组居首， 将数据的操作与数据绑定


`OOP`四大特性， `封装`、`抽象`、`继承`、`多态`

#### 封装
从形式上，封装不过是将数据与行为组合， 对使用者隐藏其方法对实现
从实现上，封装对方法仅用于与数据交互，须避免其对数据的直接访问，以提高复用性与可靠性

对象的三个主要特性
- 行为   对象实现的方法， 具体要做什么
- 状态   方法被调用时， 数据有啥变化
- 标识   hash方法， id

类间关系
-    依赖   依赖者拥有依赖项才能正常
-    聚合   包含关系
-    继承   子类继承父类所有，还能有额外功能， 子是父， 父不是子
