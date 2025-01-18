# C陷阱与缺陷

> 考研调剂那段时间在百度知道看到的书单推荐, 当时的书评很让我触动,大意是知识反复学不会往往是 - 缺少掌握该知识相关的上下文, 其推荐的学习顺序是 《K&R C》 《C陷阱与缺陷》 《C专家编程》; 只过了下前两本 多少还有些遗憾

## 1 词法陷阱
同一组字符序列在不同的上下文环境中可能有着完全不同的意义。
`p->s = "->";`
编译器中的词法分析器负责将程序分解为一个个符号

### 1.1 `=`
控制流中要慎用赋值语句
### 1.2 `& |`  `&& ||`
### 1.3 词法分析 贪心法（大嘴法）
C编译器中词法分析的处理策略为贪心法：每一个符号应该包含尽可能多的字符

符号的中间不能嵌有空白
`a -- - b` != `a - -- b`
`y = x/*p` != `y = x / *p`  == `y = x / (*p)` 

### 1.4 整型常量
当整型的第一个字符为0，会被视作八进制数
`int i = 10; // i = 10`
`int i = 010; // i = 8`

上下文对齐格式时注意别把十进制写成八进制
```C
struct {
	int part_number;
	char *descripiton;
}parttab[] ={
	046, "des1",
	047, "des2",
	123, "des3"
}
```

### 1.5 字符与字符串
单引号引起的实际是一个整数
`char c = 'a';    // c = 97`
`char c = 'yes';  // c = 115`

### 练习1-4
`a+++++b` == `a ++ + ++b`
根据大嘴法
`a+++++b` == `a ++ ++ + b`
但由于语法，a++不能为左值， a++后不能接++运算符

`a+++++b` == `a ++ + ++b`

------------


## 2 语法陷阱
### 2.1 函数声明
`()`优先级高于`*`
函数调用`fp()`为`(*fp)()`简写形式

样例：模拟开机启动，显式调用子例程
`(*(void (*) ()) 0) ()`

实则为一个函数指针， 该函数则是返回值为void的函数指针对0常量的类型转换
简化:
`typedef void (*fp) ();`
`(*(fp) 0) ();`

signal.h中 signal的声明
`void (*signal(int void(*) (int))) (int);`
简化:
`typedef void (*HANDLER) (int);`
`HANDLER signal(int, HANDLER);`


### 2.2 运算符优先级
优先级容易引起语法的歧义，通常难被编译器发现。

需注意的：
移位运算符与四则运算符
关系运算符与逻辑运算符、赋值运算符

- 最高级的运算符与结构相关， 调用，索引，成员`() [] -> .`
- 单目运算符
	 - 前述运算符, 结构自身的操作，取反，自增减， 类型转换 `! ~ ++ -- (type)`
	 - 寻址，引用 `* & sizeof`
- 双目运算符，运算需要两个变量
	- 算术运算符，四则运算 ` * / % + -`
	- 移位运算符		` >> <<`
	- 关系运算符		`< <= >= > == !=`
	- 逻辑运算符		` & ^ | && || `
	- 赋值运算符		`=`
- 三目运算符
	- 条件运算符		`cond ? true:flase`

### 2.3 结束标志-分号
需注意控制流后的分号，return后的分号
### 2.4 switch
命中case下的每个case都会执行，需考虑case后的break的必要性
### 2.5 函数调用
函数变量名有特定的地址存放其地址
### 2.6 悬挂的else
对if-else控制流要养成写{ }的习惯
嵌套的if-else控制流没有域的作用下容易进入语义陷阱


------------
## 3 语义陷阱
### 3.1 数组与指针
C99标准允许变长数组
对一个数组的操作只有：获取数组大小、下标为0的指针
`sizeof arr` 是整个数组`arr`的大小
`*(a + i)`简写为`a[i];`
`a[i]`与`i[a]`意义相同， `*(i + a)`
二维数组的变量名为一个指向数组的指针
### 3.2 非数组的指针
字符串的结尾标志符`\0`， malloc动态分配内存字符串时大小需考虑结尾标志符
### 3.3 作为参数的数组声明
只有在函数参数这个位置上数组名才与指针等同
`extern char *hello;` != `extern char hello[];`
### 3.4 避免synecdoche
注意区分指针变量与常量， 左值的限定
### 3.5 空指针
编译器保证由0转换而来的指针不等于不等于任何有效的指针
当常数0被转换为指针为指针使用时， 绝对不能被解引用， 还须注意在函数内部的解引用操作

### 3.6 数组边界 
0为数组下标起点的设计主要优势就在于其给不对称边界带来的便利性
```C
int i, a[10];
for(i = 1; i < 10; i++)
	a[i] = 0;
```
当编译器按内存地址递减的方式给变量分配内存时，数组a之后的地址将被分配给i，造成死循环

#### 不对称边界
左闭右开`[a,b)`,这样保证了数组长度为`b - a`,
```C
#include <stdio.h>
#include <string.h>

#define N 3
static char buffer[N];
char *bufPtr = &buffer[0];

void memCpy(char *dst, char *src, size_t n);
void bufWrite(char *p, size_t n);
void flushBuf(void);

int main(int argc, const char * argv[]) {
    // insert code here...
    memset(buffer, 0, sizeof(buffer));
    char *msg = "Hello From wcw!\n";
    bufWrite(msg, strlen(msg));
    
    getchar();
    return 0;
}

void memCpy(char *dst, char *src, size_t n){
    while(--n > 0)
        *dst++ = *src++;
}

void bufWrite(char *p, size_t n){
    while(n > 0){
        fprintf(stdout, "%zu %s\n",n ,buffer);
        long k;
        long rem = 0;
        if(bufPtr == &buffer[N])
            flushBuf();
        rem = buffer + N - bufPtr;
        k = n > rem ? rem : n;
        memCpy(bufPtr, p, k);
        bufPtr += k;
        p += k;
        n -= k;
    }
}

void flushBuf(void){
    bufPtr = &buffer[0];
    fflush(stdout);
}
```
`ANSI`允许对越界的地址(地址存在)对引用， 对值对引用是非法对
当`bufPtr`不能越界时，则需在`bufPtr`到达数组边界就进行`flushBuf`操作
```C
void bufWrite(char *p, size_t n){
  while(--n > 0){
    int k, rem;
    rem = buffer + N - bufPtr;
    k = n > rem ? rem : n;
    memCpy(bufPtr, p, k);
    if(k == rem) flushBuf();
    else bufPtr += k;
    n -= k;
    if(n) p += k;
  }
}
```
#### output
```
16 He
13 lo
10 Fr
7 m 
4 cw
1 cw
```
数组第三位为`\0`,故每次只输出`N - 1`个字符

### 按列打印数组
```C
#include <stdio.h>

#define NCOLS 4
#define NROWS 4
#define BUFSIZE (NROWS * (NCOLS - 1))
static int buffer[BUFSIZE];
static int *bufPtr = buffer;


void memCpy(int *dst, int *src, size_t n);
void bufWrite(int *p, size_t n);
void flushBuf(void);

void flush(void);
void printnum(int n);
void printnl(void);
void printpage(void);


#define N 20
int main(int argc, const char * argv[]) {
    // insert code here...
    int msg[20];
    for(int i = 0; i < N; i++)
        msg[i] = i;
    bufWrite(msg, N);

    flush();
    getchar();
    return 0;
}

void flush(){
    long row;
    long k = bufPtr - buffer;
    if(k > NROWS) k = NROWS;
    if(k > 0){
        for(row = 0; row < k; row++){
            int *p;
            for(p = buffer + row; p < bufPtr; p += NROWS)
                printnum(*p);
            printnl();
        }
        printpage();
    }
}

void memCpy(int *dst, int *src, size_t n){
    while(--n > 0)
        *dst++ = *src++;
}

void bufWrite(int *p, size_t n){
    while(n > 0){
        long k;
        long rem = 0;
        if(bufPtr == &buffer[BUFSIZE])
            flushBuf();
        rem = buffer + BUFSIZE - bufPtr;
        k = n > rem ? rem : n;
        memCpy(bufPtr, p, k);
        bufPtr += k;
        p += k;
        n -= k;
    }
}

void flushBuf(void){
    bufPtr = &buffer[0];
    fflush(stdout);
}

void printnum(int n){
    fprintf(stdout, "%4d ", n);
}

void printnl(){
    fprintf(stdout, "\n");
}

void printpage(){
    fprintf(stdout, "$\n");
}
```
##### output
```
  12   16 
  13   17 
  14   18 
  15    7 
```
`BUFSIZE`为`12`，到`12`的时候又从`buffer`的`0`地址开始向后写，最后的`7`是第一次写满时`index`为`8`的地址的值
矩阵对存储格式分为`row-major order`和`column-major order`，常用的还是第一种`C/C++`风格

### 3.7 求值顺序
mysql中的优化器原理与其类似
C中只有(`&& || ?: ,`)四个运算符有规定的求值顺序， 都是多目运算符
第一遍看的时候还对这个概念比较混淆，
`express1 && express2`规定了先计算表达式一，当表达式一为真再计算表达式二
而赋值表达式的求值顺序是未定义的
`y[i] = x[i++];`  在不同的编译器上可能会有不同的结果， `y[i]`被赋值时`i`的值可能变成了`i+1`， 将自增操作移到语句外部是更为保险的做法

> 疑问

strcpy的实现
`*s++ = *t++;`
`y[i] = x[i++];` 等效于 `*(y+i) = *(x + i++);`


### 3.8 `&&` `&`
`& |`,`= +`这种单双目都有的运算符，在实际编写代码时很容易由于键盘粘连，按键缺失而引起语义陷阱，

```C
int i = 0;
while(i < tabsize && tab[i] != x)
	i++;
```

```C
int i = 0;
while(i < tabsize & tab[i] != x)
	i++;
```
在表中查找元素，代码2的求值顺序是未定义的，可能也能够正常工作，还存在数组越界访问的风险

### 3.9 整数溢出
对`if(a + b < 0)`
溢出的解决方法 `INT_MAX` `<limits.h>`
1 `if((unsigned)a + (unsigned)b > INT_MAX)`
2`if(a > INT_MAX - b)`
### 3.10 main返回值
main函数为主进程入口
对大多C语言，当未声明mian函数的返回类型时默认为返回整型

### 3-3 二分查找
对称边界数组
```C
int *binarySearch(int *p, size_t n, int x){
  int lo = 0;
  int hi = n - 1;
  while(lo <= hi){
    int mid = (hi + lo) >> 1;
    if(x < p[mid])
      hi = mid - 1;
    else if(x > p[mid])
      lo = mid + 1;
    else
      return p + mid;
  }
  return NULL;
}
```
不对称边界
```C
int *binarySearch(int *p, size_t n, int x){
  int *lo = p;
  int *hi = p + n;
  while(lo < hi){
    int *mid = lo + ((hi - lo) >> 1);
    if(x < *mid)
      hi = mid - 1;
    else if(x > *mid)
      lo = mid + 1;
    else
      return mid;
  }
  return NULL;
}
```
指针`hi`与`lo`不能进行加法运算

------------


## 4 连接器
连接器的应用场景是多源文件的冲突处理
### 4.1 连接器的概念
大多连接器是独立于C实现的，连接器不能理解C语言，却可以理解机器语言和内存布局，编译器会将工程中的源码翻译成连接器能够理解的形式

### 4.2 声明与定义
变量与函数的声明与定义类似
`int a;` `void function();`
告诉编译器有这东西的存在
```c
a = 1;
void function(){
	print("Definition\n");
}
```
再补充其具体的细节
跨源的话可以通过宏，像是IDE提词器一样，帮组编译器定位实现的细节
`extern a;`
`#include "functions"`

### 4.3 命名冲突， static
连接器的一个重要功能就是检测命名冲突
对同一个作用域来说是不能有两个相同的变量名的，在跨源的情况下，是不能看到另一个源文件的全局变量名的
static关键字可以将该源文件下的变量名限定在本文件内部

### 4.4 形参，实参，返回值
函数形参列表这的形参变量为实参的拷贝，在函数调用的过程中才被初始化
当一个函数在被声明前被调用，编译器会默认将其返回类型视为整型
```c
# double function();
printf("%g\n", function());
```
注释掉声明
编译器会认为function返回整型， IDE报错原因为类型不匹配
最好函数中声明参数类型及形参变量名，这涉及到形参与实参的匹配问题
未声明形参的类型时，float会被转为double， short与char会被转为int
而类型的不当转换可能会造成地址的越位覆盖，改变周边地址的变量值
```c
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
int main(int argc, char **argv){
	int i = pow(2, atoi(argv[1]);
	char c;
	printf("%d\n", i);
	scanf("%d", &c);
	printf("%d\n", i);
	return 0;
}
```
![](https://wuchengwei.icu/wp-content/uploads/2020/05/addr_overlap-1-300x157.png)
本例是小端对齐，bit位数超过23就覆盖不到了

### 4.5 检查外部类型
类型内部表示一致的系统，原本多字节类型被错误的引用为小字节类型时，在小子节类型范围内可能不影响程序使用
还是要尽可能保证外部变量声明当一致性， 需注意字符串指针与字符串数组

### 4.6 头文件
关键字include实际上是把整个头文件的内容原封不动的粘贴到该文件中， 与宏的概念差不多
尽可能将全局变量，函数声明都写到对应的头文件中

### 4-1 大端对齐与小端对齐
最低为地址存放的字节位置决定机器是大端还是小端对齐
```c
#include <stdio.h>

int main(int argc, char **argv){
    unsigned int x = 1;
    char *endian;
    endian = (int) ( ((char *)&x)[0]) == 1 ? "little" : "big";
    printf ("%s endian\n", endian);

    return 0;
}
```

### 4-2 printf 浮点格式
有些C的编译器中， 有两种不同的printf， 有一种未实现%e、%f、%g这些浮点格式
有些系统须要显示的告诉连接器是否用到了浮点运算，另一些则是通过编译器来告诉连接器
因此对于未声明的浮点返回类型被当作整型后， 编译器来推断的话就会将忽略掉浮点运算，调用无浮点格式的printf， 导致转义字符失效


------------
## 5. 库函数
### 5.1 getchar返回整数
`char c;`
`while((c = getchar()) != EOF)`
此时c的值实则为getchar返回值的低地址字节
许多编译器的在实现上实际比较的不是c与EOF，而是getchar的返回值与EOF比较
二进制形式下伴随着-1值的出现，文件结束标志不能采用EOF，此时用feof函数的返回值来代替

### 5.2 更新顺序文件
考虑到向下兼容， 在C中对文件对交替读写操作须要调用fseek函数变更offset的状态
```C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <math.h>
#include <errno.h>


int main(int argc, char **argv){
    
    const char *zens[] = {
        "Beautiful is better than ugly." ,
        "Explicit is better than implicit." ,
        "Simple is better than complex." ,
        "Complex is better than complicated." ,
        "Flat is better than nested." ,
        "Sparse is better than dense." ,
        "Readability counts." ,
        "Special cases aren't special enough to break the rules." ,
        "Although practicality beats purity." ,
        "Errors should never pass silently." ,
        "Unless explicitly silenced." ,
        "In the face of ambiguity, refuse the temptation to guess." ,
        "There should be one-- and preferably only one --obvious way to do it." ,
        "Although that way may not be obvious at first unless you're Dutch." ,
        "Now is better than never." ,
        "Although never is often better than *right* now." ,
        "If the implementation is hard to explain, it's a bad idea." ,
        "If the implementation is easy to explain, it may be a good idea." ,
        "Namespaces are one honking great idea -- let's do more of those!",
        NULL};
    
    int i = 0;
    char buffer[100];
    char *file = "file.txt";
    
    FILE *fp;
    fp = fopen(file, "w");
//    fputs(zens[i], fp);
    fwrite(zens[i], strlen(zens[i]) + 1, 1, fp);
    fclose(fp);
    
    fp = fopen(file, "r+");
    
    while(fread(buffer, strlen(zens[i]) + 1 , 1, fp) == 1){
        printf("r: %s\n", buffer);
        if(zens[i + 1] != NULL){

            fseek(fp, -(long)(strlen(zens[i]) + 1), SEEK_CUR);
            i++;
            fwrite(zens[i], strlen(zens[i]) + 1 , 1, fp);
            printf("w: %s\n", zens[i]);
            fseek(fp, 0L, SEEK_SET);
        }
        else break;
    }
    fclose(fp);
    
    return 0;
}

```

### 5.3 缓冲输出与内存分配 
程序交互式的输出往往会造成较高的系统负担
C语言在实际输出前可以设置一个缓冲区间来缓存输出
`setbuf(stdout, buf);`
当`buf`被填满或是手动`fflush`才进行大块的输出

`buf`最好声明为全局变量，若是声明在`main`函数中须要加上`static`修饰符
否则C的`runtime`清理时，`buf`会随着main函数的作用域而被释放
另一种决解方案是动态分配
`setbuf(FILE *fp, malloc(BUFSIZ));`

```C
#include <stdio.h>
int main(){
  static char buf[BUFSIZ];
  setbuf(stdout, buf);
  puts("block buffer\n");
  // fflush(stdout);
  getchar();
  return 0;
}
```
`setbuf`的`buf`大小应至少为`BUFSIZ`， 取消`fflush`的注释即可立即打印输出



### 5.4 errno
很多与操作系统相关的库函数，在执行失败的时候会通过外部变量`errno`来通知程序调用失败
调用库函数成功时也可能设置`errno`，应先检测库函数返回值的错误指示， 确定调用失败后再来检查`errno`
```C
if (somecall() == -1) {
    int errsv = errno;
    perror("somecall() failed\n");
    if (errsv == ...) {
        fprintf(stderr, "some call() failed: %s\n", strerror(errsv));
    }
}

```
perror会自动在字符串后在上errno对应的文本信息，与strerror(errno)功能一致
### 5.5 signal
`signal`用于捕获异步事件
`signal`处理函数唯一安全、可移植的操作是打印错误信息
`signal`具有些不可移植的特性，因此处理函数须尽可能简单以便于修改使用于新系统

### 5-1
当输出缓冲区未被清空，程序又异常终止时，程序的输出会丢失，所以在调试时可以强制不允许缓存输出
`setbuf(stdout, (char *)0);`
### 5-2
未包含stdio时，getchar与putchar要慢得多是由于函数调用的开销造成的，宏的时间开销比函数调用要少得多

------------
## 6 预处理器
一般的编译器：
词法分析负责将字符流转化为`token`流
语法分析负责构建AST abstract syntax tree
符号表则随着AST而构建

而C由于预处理器，词法分析时会单独生成宏相关 (#开头)的符号表，JIT这种即时编译的编译器会在语法分析的时候为作用域内的字段建立符号表

### 6.1  不能忽视宏定义的空格
`#define`替换名后的第一个空格分隔替换内容
`#define f (x) express`
将`f`替换为 `(x) express`

### 6.2 宏不是函数
`#define`作用是将源文件中对应的内容原封不动的替换， 因此宏定义经常伴随有副作用
常规做法是将替换内容中的变量、运算、操作都用括号括起来

### 6.3 宏并不是语句
在宏定义中，若是有控制流，须带上其作用域
`#define assert(e) if(!e) assert_error(__FILE__, __LINE__)`
若不带上作用域可能会引起else的悬挂
`#define assert(e) if(!e) {assert_error(__FILE__, __LINE__);}`
带上作用域后，在`if-else`结构中使用宏，else前有`;`号,造成语法的错误
`assert(e)`后不加分号语法上显得有些不统一
最好的选择是将宏定义成一个表达式

### 6.4 宏不是类型定义
用宏定义类型可以提高代码的可移植性
对多变量对声明，更适合用typedef来定义类型

### 6-1 MAX宏
MAX宏中参数的使用可能不止一次，所以有必要存储到临时变量中
当MAX不止用于一个文件里，须要static修饰临时变量以防止重名冲突
```C
static int tmp1, tmp2;
#define MAX(x, y) (tmp1 = (x), tmp2 = (y), \
        tmp1 > tmp2 ? tmp1 : tmp2)
```
[更多的实现方法](https://www.zhihu.com/question/22465774/answer/660997629)

### 6-2
对`(x) ((x)-1)`
当`x`为`int`时，表达式对含义是将`-1`进行两次同类型对转换
但`x`为函数指针，`(x)-1`则为函数但参数，此时x必须实际指向某函数指针数组中的某个元素
`x`类型为`T` `T x;`时，`x`所指向的可以是任何能被`T`转换而得到的类型
 `typedef void (*T)(void *)`
对于一些看上去怪异对结构不能轻率对一律视其为错误

------
## 7 可移植性缺陷
### 7.1 应对C标准的变更
语言随着时代而发展，每当新的特性出现，在给编程带来巨大方便的同时，可能会损失部分潜在用户
程序的生命周期是难以预料的，即使是自用目的编写的程序，也需要尽可能考虑到未来的需要，其拓展性

### 7.2 标识符名称限制
ANSI标准能够识别出前6个字符不同的外部名称，不区分大小写
要保证程序的可移植性，须谨慎的选择外部标识符名称

### 7.3 整数的大小
字符的行为方式与小整数类型类似
int可以容纳任何数组下标
字符长度由硬件特性决定
目前的`64`位机器，`int`为`4`个`BYTE`，`char`为一个`BYTE`，而一个`BYTE`有`8`位

### 7.4 (unsigned) char 
对一个`8`位的`char`，不同的编译器默认的解析方式可能不同(有无符号)
当把一个字符值转换为大整数时，多余的位将被丢弃
字符转`有符号数`会同时复制符号位
字符转`无符号数`只需在多余的位补0
字符转为无符号整数时会被先转为int, 需显示声明`(unsigned char)c`

### 7.5 移位运算符
向右移位时空出位的填充跟编译器有关，无符号数由`0`填充，有符号数可能由符号位填充
移位运算速度比直接做除法要快得多

### 7.6 内存位置0
null指针只有在赋值、比较运算下是合法的
内存位置0的读写权限跟编译器有关

### 7.7 除法运算的截断
`q = a / b;`
`r = a % b;`
C的定义只保证了 q * b + r = a， 当`a >= 0 && b > 0`, 有`|r| < |b|`、 `r  >= 0`
在`hash`算法中，对要做`%`运算来得到`hash表`索引的数，要避免其值为负

### 7.8 随机数大小
在程序中若用到rand函数，移植时须根据特定的C语言作出裁剪，
ANSI中定义了常数RAND_MAX

### 7.9 大小写转换
ctype.h 
toupper tolower宏的实现依赖于字符集的性质，大小写字母编码拥有相同的常量差，如ASCII、EBCDIC

### 7.10 内存的释放、再分配
在有的编译器中， 释放掉的指针能用`realloc`直接重新分配大小
`free(p); p = realloc(o, newsize);`

### 7.11 可移植性案例
long型整数转换其10进制表示
可移植代码或许会面临的问题：
- 字符集不是顺序排序， 不一定有`'0' + 5  = '5'` 
  - 当字符集顺序排序，不同机器`int`与`long`的内部表示可能不同，需要类型转换
- 负数符号取反造成的数值溢出
- 负数余运算结果可能为正，造成索引的寻址异常
  
```C
void printneg(long n, void (*p)())
{
    long q;
    int r;
    q = n / 10;
    r = n % 10;
    if(r > 0)
    {
        r -= 10;
        q++;
    }
    if(n <= -10) printneg(q, p);
    (*p) ("0123456789"[-r]);
}
printnum (long n, void (*p)())
{
    if(n < 0)
    {
        (*p) ('-');
        printneg(n, p);
    }
    else
        printneg(-n, p);
}
```
大多数软件的生命周期要大于其硬件的

 ---
## 8 建议
 
 - 有些错误极具伪装性与欺骗性，注意运算符优先级，左值的有效性
 - 表明意图，用括号或注释让程序的功能清晰，例如将常量放在判断相等表达式左侧，编译器可以捕获将`==`写成`=`
 - 考查最简单的特例
 - 使用不对称边界
 - 避免使用生僻的语言特性
 - 防御性编程

 
## 附录
### A.1 printf family
调整`修饰符`、`标志`、`可变域宽`、`精度`的格式
### A.2 varargs.h
可变参数列表，`ANSI`标准下对头文件对应`stdargs.h`
### A.3 stdargs.h
类似`printf`，通过第一个参数来确定后面对参数类型
`stdargs.h`的函数至少需要知道一个固定类型的参数
```C
int printf(char *fmt){
  va_list ap;
  va_start(ap, fmt);
  int n = vprintf(fmt, ap);
  va_end(ap);
  return n;
}
```

<!-- 2020年5月29日 13:13 -->