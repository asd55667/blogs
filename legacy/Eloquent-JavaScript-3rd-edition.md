<!--
updated: 2020年7月17日 09:26
tags: [book, programming language, javascript]
-->

# JavaScript编程精解(第3版)

> 入门js时阅读的书籍 知乎上关注的emacs大佬的推荐

## 1. 值、类型、操作符
### Number
js中数值位数为64位

### 特殊Number
`Infinity `、 `-Infinity `、`NaN`

### 串
单双反引号``'"` ``
用反引号进行模板操作`` `half of 100 is ${100 / 2}` ``
`${}`提取变量

### 单目运算符  
`typeof` 类似 python中的`tpye`， 返回类型名

### 空值
`undefined`
`[]`不为空值, `![]`为`false`

### 自动类型转换
`== !=`运算符判断条件较宽松, 会对运算符两端变量进行类型的适配转换， 数值相对类型不等的情况返回值为`true`
`=== !==`为严格判断， 类型数值均相等返回`true`

### 逻辑运算符的短路特性
当逻辑运算符两端的类型不一致时，会先将左侧值转换为布尔值，作为判断条件， 演变成三元运算符`a? a:b`
常常应用在变量取默认值的场景

----

## 2. 程序结构
### 表达式与声明
### 绑定
`let var const`

### 绑定名
绑定的全局变量`$`in `jQuery`  `_` in `Underscore/lodash`
选择器`$(表达式)`   `$(element)` `$(function)`
`_`可作为占位符， 拆包时绑定无用变量

###  环境
作用域`{}`，变量的生命周期

----
## 3. 函数
### 定义函数
当函数没有return语句时， 返回值为`undefined`

### 函数作为值绑定
`let func = function(){};`

### 箭头函数
匿名函数 `const func = (x) => {};`

### 变长参数
实际调用的参数少于函数声明中时， 未传参数默认为`undefined`, 反之冗余参数则被忽略

### 闭包
函数内的局部绑定在每次调用时会重新创造，在不同调用中是相互独立的
闭包能在其作用域内引用一个特定的局部绑定， 用作装饰器可以将该局部绑定作为属性绑定到特定的函数中

----
## 4. 数据结构 Object  & Array
### Object
`'assign' in Object` === `true`, 对应python中 `hasattr(max, '__str__')`
Object的方法通常为静态方法， 用法 `Object.keys({'x':1, 'y':2});`

### Array
|     js           |python|
| ------- | ------- |
| `[].includes(i)`|   `i in [] `|
| `[].push`  |  `[].append` |
| `[].shift()` |  `[].pop(0)` |
| `[].unshift(i)`  |  `[].insert(0,i)` |
| `[].indexOf`  |   `[].index`|
| `[].concat`  |   `[].extend`|

### String
`s.trim()`除去两端的空白

函数签名拆包
```javascript
function func(...args){
    args.forEach(arg => {console.log(arg);});
}
```

----
## 5. 高阶函数
### filter
数组元素筛选， 返回一个满足条件的新的数组对象, `(returned []).length <= [].length`

### map
遍历数组，进行聚合操作， 返回每个操作后结果组成的数组， `(retured [].length === [].length)`

### reduce
遍历数组，进行累积操作， 返回数组的累积属性， 

### 字符串和字符码
`charCodeAt `返回一个长度的unicode字节码， `codePointAt `则是两个

----
## 6. OOP
### 封装
将数据以及对其操作的函数分配同一个独立作用域，
同一程序中不同区域通过接口进行交互

```javascript
class interface {
    method(){}
}

var instance =  function(property){
    this.property = property;
}

instance.prototype.method = function() {};
```
严格的接口的实现可以对方法进行属性检查，
宽松一些的可以实现鸭子类型，使接口具有同样的表征能力

### 方法
在js中，实例的方法等价于给其属性赋值一个函数对象, 
实例方法调用中的`this`指向该实例自身
```javascript
function speak(line){
  console.log(`The ${this.type} rabbit says ${line}.`);
}
let r1  = {type: "white", speak};
let r2  = {type: "black", speak};
r1.speak('carrot');
r2.speak('cucumber');
// speak 将this显示绑定到r1上， 不进行绑定this将默认为undefined
speak.call(r1, 'carrot');
```
箭头函数并不绑定到它们自身的`this`上

### 属性
当在实例自身的属性中未找到某一属性时， 会进而到其原型`prototype`上继续查找该属性
原型作为属性绑带到每个实例上， 可以通过实例的原型属性获取继承链的父对象
Object的原型为null
Object的create方法可以为对象指定原型

原型比较适合定义所有类实例都通用的属性
在各个实例中都不同的属性应该绑定到实例本身， 通过构造函数，初始化的时候将该属性绑带到该实例上， 构造器返回的实例会自动获得原型属性，默认会包含一个从Object原型派生出的空对象

### 类
js的类就是拥有原型属性的构造函数
类中仅有方法属性会被打包到其原型上

### Map字典
直接用`{}`时会继承Object原型内的方法,  键值会包含原型上的方法， `Object.create(null)`则可以构造没有任何原型的实例
属性名通常为字符串， 当键值不易转换为字符串时， 仍用`{}`作为字典的话，`hasOwnProperty`方法可以排除原型上的方法，Map类可以允许任意类型的键值

### 多态
多态的动态绑定， 运行时将调用子类重写的接口，`for/of循环`能遍历不同的数据结构，只要它们实现了对应的`iterable`接口

### Symbol
不同接口可能会引用同一个属性来实现不同的行为
属性名可以为`Symbol`, Symbol在参数注册后会保留在集合中，无法再度注册同一参数
由于Symbol的唯一性，适合被用来定义接口
`obj[Symbol]`和`expression[Symbol]`中Symbol是可以作属性名被解析的

### iterator 接口
`iterable`对象具有Symbol.iterator方法，当被调用时，返回的对象提供第二个`iterator`接口，通过`next`方法对其包含元素的进行迭代，迭代到最后一个元素时，`done`属性为`false`
```javascript
Obj.prototype[Symbol.iterator] = function() {
  return new ObjIterator(this);
};

class Obj{
[Symbol.iterator]() {
    return new ObjIterator(this);
  }
}

```

### getters, setters, and statics
接口通常由方法及键值属性组成
`getter、setter`如python中的`property`， 用方法将值封装起来以间接访问修改属性值，
static修饰的静态方法存储在构造函数中， 对该对象，具有一定的独立性，不需实例化通过对象可以直接调用

### 继承
与java中一样对extends，子类继承父类所有， 重写已有方法， 运行时实现动态绑定， 根据子类对特效，添加自身的新方法
`instanceof`运算符，判断原型链上是否有关联

---
## 8. Bug & Error
### Strict mode
将`"use strict"`放到js文件或是函数内顶部将开启`strict`模式
`strict`模式下js解释器会更严格的解析代码语法，
`strict`模式下的函数内，未绑定局部变量是无法使用的，非`strict`模式会自动将其绑定到全局变量中去
```javascript
function canYouSpotTheProblem() {
  "use strict";
  for (counter = 0; counter < 10; counter++) {
    console.log("Happy happy");
  }
}
```
另一变化是`this`的绑定，`strict`模式下`this`不能作为方法调用且值为`undefined`，而非`strict`模式下的`this`是绑定到全局的，例如，当调用构造函数不加`new`关键字时使用`this`绑定属性

`strict`模式下还不允许为函数提供多个具有相同名称的参数

### 类型
强类型语言能在代码编写的过程中避免一些潜在的问题，
弱类型的js，python可以在注释中书写输入输出类型， python在最新的版本也都直接支持在签名添加类型注解了
js的强类型版本ts也是一种趋势吧

### 测试
代码的稳健性，须经得住测试， 尽量使用现有成熟的外部框架组件

### 调试
打断点，console.log

### 异常处理， 抛出异常
程序遇到异常error通常会选择退出，`try catch finally`捕捉异常，可以编辑异常后的行为，给出提示，或是进行别的操作，
`throw`可以主动抛出异常， 当行为不符合预期可以主动抛出

### 断言
当某一对象或是绑定具有准确是约束，断言用以确保该约束时时被满足， `python`有关键字`assert`， js中需要手动判断将其抛出

---
## 9. 字符串处理，正则
用`RegExp(pattern)`或`/pattern/`构造一个`re`的实例， 
`/pattern/.test(string)` 是否存在匹配项
`
group`内的`^`为非
`/pattern/.exec(string)` 返回全局匹配与所有`group`匹配，第一匹配项的`Array`， 没匹配到的`group`返回`undefined`

`\b`在`pattern`中用于定位单词边界

### 匹配机制
匹配时会记录`pattern`首部匹配的索引，当某一分支不满足时会进行回退

### 子串替换
`string.replace(//, subtitution)`， 替换首匹配项
`string.replace(//g, subtitution)`， 全局替换
`/g/global`，全局， `/i/insensitive`，不区分大小写, `/s/stiky`,  当`lastIndex`与匹配项起始`index`一致才能匹配成功
`/u/unicode` `unicode`编码

`$i`可以像`shell`中那样对`group`匹配项取值
`string.replace(/(\w+), (\w+)/g, "$2 $1"))`可以实现第一个与第二个`group`的互换

`replace`方法的第二个参数可以为回调函数， 实现对`group`匹配项的自定义行为替换

### 贪心
`+, *, ?, {}`模板会尽可能多的匹配字符， 而将其后的模板给覆盖
移除注释`code.replace(/\/\/.*|\/\*[^]*\*\//g, "")`
可以通过`?`修改其权重，以达到非贪心匹配策略
`code.replace(/\/\/.*|\/\*[^]*?\*\//g, "")`

### 匹配项索引
`string.search(pattern)`

### 正则实例的lastIndex属性
`lastIndex`属性的值为下一次`exec`方法执行的起点， 同一个实例多次执行`exec`方法会从上次的`lastIndex`开始匹配
`exec`匹配失败返回`null`, 且`lastIndex`被置`0`

### 编码
对于多字节码的正则匹配，需注意字节数，单字节模板`.`不能匹配单个的双字节码字符， 
应尽量避免在`pattern`直接用`utf,gbk`等编码

---
## 10. 模块
仅将js代码拆分成几个文件，它们也还是在同一命名空间，代码间还是会存在相互作用

包管理工具`npm`
 `licence`首选MIT， BSD， Apache

2015年起，js也有了内置模块系统， 能用函数轻易的构建局部作用域，用对象来代表模块的接口
 
 ### 文本代码解析
 文本代码的解析是控制加载的依赖项所必不可少的一部分
 `eval`函数解析的代码仅停留在当前作用域，更合适的方法是使用`Function`类的构造函数，构造的实例拥有独立的作用域
 
 ### CommonJS
 通过调用`require`函数返回调用模块的接口，node和浏览器会将模块加载并缓存在`require`的属性中， `require`会解决该模块的依赖问题，并将模块exports导出的对象接口绑定给指定的变量
 当接口原型是函数时， 模块系统会创建一个空的接口对象并绑定到exports
 
 ### ES6 模块
 `export`关键字直接加到函数、类、绑定前就能导出
 `import`导入
 
 `export default expression/declaration;`
 `default`关键字作为模块的主键， 当被导入不进行拆包， 那么被导入的就是`default`字段
 模块的导入发生在模块被运行之前

---
## 11. 异步编程
现实生活中医生看病的场景就是异步的， 一个专家看多个病人， 问诊后的各种检查收费需要病患自行处理， 这个病患事件并未结束， 这时医生却已经开始了下一个病患事件， 当先前的病患处理完事务又会回到医生这结束该事件

异步编程的适用场景通常是`I/O bound`任务， `cpu`的效能相对比`I/O`大得多，例如爬虫等`web`应用，事件消耗多在请求的响应
相对的同步编程则是`CPU bound`，例如神经网络训练`BP`的梯度同步， 异步情况下可能还会影响收敛结果

### 回调
js中往往使用回调函数来实现异步编程，
```javascript
setTimeout(()=>console.log(5),5000);
console.log(1);
```
脚本并未等待上一条语句的实际命令执行就开始执行下一条语句，先打印`1`再打印`5`

### Promise
`Promise`将异步回调进行抽象封装， 通过`Promise`的`then`方法承接或继续传递回调的结果，
代码执行到`Promise`这时，`Promise`的输出可能还并未成功返回

回调式的异步函数很难将错误抛出， 传统做法是给回调函数添加一个异常信号
`Promise`通常提供两个`handler`来应对回调的成果与异常， `handler`的结果会在回调链中传递
`catch`方法会在接受到异常时注册一个新的`handler`, 并从此处重置回调链

### 网络
在web应用使用`Promise`使逻辑极为清晰， 常用来封装网络回调
```javascript
function request(params) {
  return new Promise((resolve, reject) => {
    let done = false;
    function attempt(n) {
      wx.request(params['url'], params['header'] 
        success:(result) => {
          done = true;
          resolve(value);
        },
        fail:(err){
          reject(err);
        }
      });
      setTimeout(() => {
        if (done) return;
        else if (n < 3) attempt(n + 1);
        else reject(new Timeout("Timed out"));
      }, 250);
    }
    attempt(1);
  });
}
```
在小程序调用`web` `API`, 网络在每`250ms`请求一次，至多请求`3`次，在规定时间内未得到响应即退出
`Promise`的`resolve`方法负责将输入转为`Promise`

对长连接的心跳机制， 可以通过高阶函数将未返回响应的客户端过滤掉， 对`Promise`回调链所有回调的捕获使用`all`方法

### async函数
`Map.keys()`返回`Iterator`对象，可通过`Array.from`将其转为数组
`async`关键字将其修饰的函数会隐式的返回`Promise`对象，配合`await`关键字接受`Promise`对象， 并将其拆包

### 生成器
`function*`声明生成器函数， 与`python`里一样，要配合`yield`关键字，
实现类生成器需重写器原型链上的`Symbol`
```javascript
classname.prototype[Symbol.iterator] = function*(){yield};
```

### Event Loop
回调有自己的调用栈， 这造成了直接在回调中捕获异常极为困难
单处理器一个时钟频率内只能执行一条命令， 命令的优先级会按照队列顺序
回调结束后其控制权并不直接回到调用方， 会先检查当前是否有命令已在执行，


---
## 13. JS与浏览器
`js`伴随着浏览器的发展，有着与`C`,`Java`同等的生命力， 不会轻易衰落

浏览器通过`URI`获取资源地址
`URL ~= protocol + server + path`   
`protocol`对应`OSI`七层模型顶部的应用层协议, 常见的包括文本的`http(s)-80(443)`,邮件的`smtp/pop3/imap-25/110/143`，文件的`(s)ftp-(22)21`
会话层`tls`用于保证连接安全性
传输层`tcp`提供可靠传输，拥塞/流量控制
网络层`IP`寻址、路由

渲染层`html`,`css`分别对应页面的骨架与血肉
逻辑层`js`负责页面交互，事件处理，表单提交

`html`转义关键字文本以连字符`&`起始`;`结束

---
## 14. DOM
我们日常浏览的网页实则是浏览器通过网络请求获取的数据，并被缓存在其进程中

浏览器内置的`js`引擎通过`html`解析器将该文档数据以`tag`为结点转换为树形结构
然后像这样的一个其结点可以绑定事件，访问内容的树形结构文档， 就是常见的`DOM`了
`DOM`被绑定到全局变量`document`
根节点为`documentElement `方法返回的`html`标签结点

每个`DOM`结点都拥有`nodeType`属性,  其值`1,3,8`分别对应类型`ELEMENT_NODE， TEXT_NODE， COMMENT_NODE`

### 标准
`DOM`的接口设计并不是专门针对`JS`的， 不光支持`HTML`,  相对更广义些的`XML`,`DOM`也是支持的
这就造成了一些结构的设计时做了折中， 子结点的数据类型不为`Array`， 不支持切片以及高阶函数
直接对`DOM`的修改性能及其低下

### 查找
对树结构的`DOM`进行结点查找， 对树进行遍历查找是不可取的
所以每个结点都有集成查找方法，标签属性
查找方法返回改调用结点下所有满足条件的结点数组

### 自定义属性
通用属性为`class`， 自定义时，惯例给自定义属性加上前缀`data-`, 
结点的`getAttribute`, `setAttribute`方法获取或修改属性


### 布局
浏览器引擎渲染布局时会参考标签的性质
不同的标签的布局可能是不同的
内联的`inline`标签渲染时不换行, 如`p, h1, a, strong`
视图容器`div`则是`block`

### 查询选择器
`querySelectorAll`方法不光定义在结点中， 文档对象也包含此方法
与`getElementsByTagName`不同的是， `querySelectorAll`查询速度较慢，返回的是`HTMLCollection`的静态内容，不随着后来的交互而改变

---
## 15. 处理事件
一些传统的轮询机制来周期性的监听事件是低效的
浏览器处理事件机制是等待系统的主动通知，来获取事件请求

`window`为绑定引用浏览器的内置窗口对象，通过结点`addEventListener`方法注册事件的处理方式
```javascript
node.addEventListener('event', callback=()=>{;});
```

### 事件对象
可以通过捕获的事件对象来获取触发事件的一些属性
`button`组件绑定鼠标事件, 事件对象的`button`属性对应鼠标点击的左中右键， 事件对象的`key`属性对应键盘敲击的字符， 回车键为`Enter`
绑定的事件名对应具体行为, 

```javascript
button.addEventListener('mousedown', e=>{e.button;}) // e.button === 0,1,2/左,中,右键
```

事件的`pageX,pageX`属性为标签对象相对整个文档左上角的像素距离
事件的`clientX,clientY`属性为标签对象相对当前屏幕左上角的像素距离

鼠标的移动事件`mousemove`与点击事件`mousedown`组合可以实现拖拽效果

### 事件冒泡
子节点监听的事件会逐层级向上传递， 父节点的句柄函数也会有对应的事件
`stopPropagation`方法可以用来阻止默认的事件冒泡

### 默认事件
浏览器对标准输入绑定有默认事件， 当你绑定某个事件又与默认事件冲突时， `preventDefault`方法可以禁用一些默认事件
有的事件是不准许被禁用的, `chrome`中标签页关闭事件 `ctl` +  `w`

### touch事件
触摸屏与传统的浏览器不同， 它可以同时接受多个触碰， 部分事件可能不能很好的兼容多端

### 滚动事件
当`DOM`内容超出屏幕尺寸时， 浏览器右侧就会出现滚动条，
滚动事件可以监控页面的滚动， 常被用于监控用户行为， 以及展示页面浏览进度

`preventDefault`方法不能禁用滚动事件， 事件句柄函数会在当前滚动结束后被调用

### Focus事件
`Focus`先关的事件都不会向上冒泡
具体场景则是表单输入， 当用户点击表单输入框时触发`focus`事件，显示提示内容
`Focus`事件触发后，状态会保留， 此时再点击其余元素时， 会触发`blur`事件， 屏蔽提示内容

### Load事件
当页面加载完， 窗口及`DOM`主体会触发`load`事件, 对于需要页面加载完的初始化行为，可以通过`load`事件来指定

`beforeunload`事件主要针对用户意外丢失的页面

`load`事件也不会向上冒泡

### Event Loop
`js`单线程同一时刻只能执行一条命令

浏览器有提供并行策略， 可以开启新进程
可以绑定新的`worder`对象  `new Worker('code.js')`

### Timer
`setTimeout`可以设置定时回调任务， `clearTimeout`可以对`setTimeout`的绑定，在其指定时间内对其取消

### 防抖机制
场景是文本框和搜索框， 针对每个键盘事件， 如果个个按键都去触发响应， 对浏览器的负担是一方面， 更多的还是用户体验受影响
也可以通过设定定时器来延缓对用户输入的接受

---
## 17. Canvas
`canvas`标签的旨在提供不同样式绘图，
通过绑定`context`对象所提供的接口进行绘图， 目前的两种主流接口为`2d` 和`webgl`， 分别对应`2/3d`绘图
`ctx = document.querySelector("canvas").getContext("2d");`

### 边，填充
`fill`对指定形状填充颜色
`stroke`给形状描边

### 路径
点线画图
初始化起点
`ctx.MoveTo(x, y);`
连线至新起点
`ctx.lineTo(x, y);`

### 曲线
#### 二次曲线
`cx.quadraticCurveTo(x0, y0, x1, y1);`
`x0,y0`为锚点， `x1,y1`为终点

闭合起点终点
`ctx.closePath();`
显示边缘
`ctx.stroke();`

#### 贝塞尔曲线
`ctx.bezierCurveTo(x0, y0, x1, y1, x2, y2);`
`x0,y0`  `x1,y1`为锚点， `x2,y2`为终点

#### 圆弧
`ctx.arc(x, y, radius, theta1, theta2);`

### 文本
可以把文本视作形状， 也可以进行`fill`和`stroke`

### 图片
`canvas`可以将位图或矢量图源导入， 并在画图中编辑
`ctx.drawImg(img, x, y, width=w, height=h)`

### 形变
先对`ctx`设置了形变， 后画的图会附带形变效果
scale设置两轴的形变比例
`ctx.scale(horizontal, vertical)`
偏移
`ctx.translate(x,y)`

形变状态入栈/出栈， 重置
`ctx.save()`、`ctx.restore()`、`ctx.resetTransform()`

### 图形接口选择
纯`html`开发成本低，与文本契合度高， 图形效果差

`SVG`矢量图不受缩放影响， 当图形占据多行时不易与文本对齐

`canvas`画布提供像素级图形， 不用修改`DOM`结点， 适合渲染大量的小型元素，性能好

`SVG`与`html`绘制图形可能会涉及到对`DOM`操作， 包括对图形部分元素进行修改实现动画效果

---
## 18. HTTP和表单
交流的本质是没有状态的，客户端请求须满足服务端能解析的最低限度要求，且不借助服务端缓存
### `RESTFUL`架构
#### URI规范
`/`与文件路径类似，表层级关系，
`_ -`作分隔符，
`?`过滤资源， 对应请求参数
`, ;` 同级资源

#### 接口规范
接口统一，`GET POST PUT DELETE`
状态码
`1xx/2xx`表请求成功
`3xx`表资源变更情况
`4xx`表请求错误， 资源丢失
`5xx`表服务异常

#### 资源
针对不同资源不同格式对应不同请求字段值， 内容协商选择资源的表述形式
相关联资源链接

#### 状态转移
请求与响应的独立， 相同的请求随着资源的改变会得到不同的响应
对不同的请求， 相同的资源却产生不同的响应， 即状态发生了转移

### 浏览器与HTTP
一般的站点通常也有`10~200`资源， 为了更快的获取这些，浏览器会同时发送多个请求

表单标签用于将其内容提交给服务器， 

当表单方法为`GET`时， 表单参数会作为请求参数直接追加到目前站点`URL`的尾部`?key=val&...`
当参数中包含关键字时会自动被转义, `?`会被转义为`%3F`， `js`中对应的编解码方法为`encodeURIComponent/decodeURIComponent`

当表单方法为`GET`时， 表单参数会被请求放置到请求体中， 而不是直接追加后缀

`GET`请求应被用于无危害的，简单获取资源的场景，
`POST`请求通常会影响服务端数据，

### Fetch接口
`js`发送`HTTP`请求的方法为`fetch`， 调用`fetch`会返回一个包含服务端响应的`Promise`, 响应的`header`属性为一个`Map`实例

浏览器会自动加上`HOST`字段以及请求体信息的字段， `HTTP1.1`以后版本必带`HOST`字段

### RPC
`rpc`架构下，`C/S`结构的通信就是跨机器的函数调用， 此时`HTTP`只是通信工具， 被`wrap`进底层抽象中


### 表单
表单源于`js`时代之前的`web`， 用于为用户提供接口提交`http`请求， 该场景下， 假设所有与服务端的交互均将定向到新的页面

随着`web`的发展， 目前`DOM`的表单标签与其他标签也有一些共性， 当然表单还有其特殊的意义

表单内的常用标签`input`与其属性`text`,`password`, `checkbox`, `radio`,`file`,`textarea`
`js`针对这些元素都提供了各自的接口

#### focus方法
表单与键盘的`focus`连结紧密， `document.activeElement`的值为当前调用`focus`的元素
对一些注册页面， 为增加用户体验，少点那么一下鼠标， `autofocus`属性会在加载页面后自动调用表单的`focus`方法

`Tab`键默认会对表单中的调用`focus`方法的元素进行切换， 可以修改`tabindex`来改变`Tab`切换顺序

`disabled`属性用来禁用该表单元素

#### form-wrap
当`DOM`结构下有表单标签存在， 那么 `form`属性就会自行绑定到`DOM`上， `form`属性下还会一个`Array`的实例属性`elements`， 对应绑定的表单元素
元素的`type`属性会将其值绑定到其对应的`elements`上去，  `type`值为`submit`的元素会负责表单的提交

`submit`元素被操作时， 浏览器默认会重定向到元素的`action`属性值的资源

`textarea` `input` `text` `password` 共享相同的公共接口， `value`属性记录他们的当前值

### 客户端缓存
`localStorage`对象用于管理浏览器缓存
`setItem`, `getItem`,`removeItem`方法对应`存`,`取`,`删`操作

---
## 20. Node
`node`为`js`的运行环境，跟虚拟机，解释器类似， 不提供浏览器那样的图形窗口

`progress`绑定当前进程， 可用来解析命令行参数， 控制进程的退出

### 模块
#### CommonJS模块系统
内置的`require`函数用来加载模块
当未指名参数为目录时，默认会搜索该目录下的`index.js`文件

`npm`包管理工具， 命令行执行`npm install`时，`npm`会初始化`node_modules`目录将模块下载至其中， 默认安装路径是当前目录下
每个工程下应有一个`package.json`配置文件， 配置该项目相关的依赖包， `npm`安装的模块会将其依赖更新至配置文件的依赖中
`package.json`还会记录各个依赖的版本信息
`npm` 亦可拿来发布模块
`yarn`是跟`npm`一样的包管理工具， 可以通过`npm`安装`yarn`

### 文件系统模块fs
读写文件函数`readFile`、`writeFile`
读文件默认编码是`binary` ， 写文件是`utf8`

`promise`版
```javascript
const {readFile, writeFile} = require("fs").promises;
```

同步版`readFileSync`

### HTTP模块
`createServer(request, respones){}`函数异步监听网络端口， 返回响应
`request({}, response)`函数异步发送`http`请求
`node-fetch`为浏览器`fetch`对应的`promise`版本
`graphql api test`
```javascript
const fetch = require('node-fetch');
fetch("http://node.wuchengwei.icu/api", {
    method: "POST",
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
        "query": "mutation { praise(id: 1, s: 1)}"
    })
})
  .then(res => res.json())
  .then(res => {
    console.log(res);
   })
```

### 流
`writable stream`在node中是个很宽泛的概念
`write`方法的对象可以将字符串或是`Buffer`对象写到流里去，
`end`方法用来关闭流句柄

`node`提供`createWriteStream`函数来返回一个指向文件的流

`Readable streams`就更多了， `createServer`中的`request`和 request函数中的`response`均为`Readable streams`， 仅可以进行读操作
对应的起止方法为`data`, `end`

`node`中实例的`on`方法对应浏览器中的`addEventListener`

`pipe`方法用来将`readable stream`转化为`writable stream`,  并不直接换回`promise`
