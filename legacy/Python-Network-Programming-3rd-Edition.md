# Python网络编程（第3版）

> 那会儿想学网络编程相关的 python稍微熟一点 知乎上的推荐书单之一

## 1. C/S网络编程
### 1.1 协议栈与库
复杂网络建立在简单网络服务的基础之上
`virtualenv`可以从当前的`py`环境剥离出来一个较为纯净的`py`环境
`anaconda`是重量级的包管理工具， 其功能包括`virtualenv`，但不限于此
`miniconda`则为轻量级的`anaconda`

### 1.2 应用层
到应用层这里就是`requests`这种高度封装，对很多情况都有了解决方案，进行适当的参数选择，使得`http`变得极其简洁
```python
import requests
def get_token(appid: str, secret: str) -> (str, str):
    url = f"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={appid}&secret={secret}"
    res = requests.get(url).text
    res = json.loads(res)
    return res['access_token'], res['expires_in']
```

### 1.3 使用协议
`google`地图的`api`也需要绑定项目`id`之类的了，换成微信小程序版本
```python
import http.client
import json

# this function call doing encoding job for request param
from urllib.parse import quote_plus

def get_token(appid: str, secret: str) -> (str, str):
    path = f"/cgi-bin/token?grant_type=client_credential&appid={appid}&secret={secret}"
    conn = http.client.HTTPSConnection('api.weixin.qq.com')
    conn.request('GET', path)
    raw_res = conn.getresponse().read()
    res = json.loads(raw_res.decode('utf8'))
  
    print(res['access_token'], res['expires_in'])  
    return res['access_token'], res['expires_in']
```

### 1.4 原始网络会话
基于`socket`编程
惨痛的教训， 写请求`header`不能有空白，一个都不行， 尤其是`python`的缩进， 能让`bug`产生于无形之中
```python
import socket
import ssl



def get_token(appid: str, secret: str) -> (str, str):
    req = '''
GET /cgi-bin/token?grant_type=client_credential&appid={}&secret={} HTTP/1.1rn
HOST: api.weixin.qq.comrn
User-Agent: wcw-py-demorn
Connection: closern
rn
'''
    
    req = req.format(appid, secret)
    
    sock = socket.socket()
    sock = ssl.wrap_socket(sock)
    sock.connect(('api.weixin.qq.com', 443))
    
    sock.sendall(req.encode('ascii'))

    raw_res = b''
    while 1:
        more = sock.recv(1 << 12)
        if not more: break
        raw_res += more

    sock.close()
    print(raw_res.decode('utf8'))
    return raw_res.decode('utf8')
```
`TCP`协议下的`sendall`方法的参数，在实际传输中会被分割成多个数据包


### 1.5 网络层级
应用层的具体网络服务， 往下是调用的是`request`， 解析`url`，参数，协议

抽象层级到了`http`协议，代码变长了些， 剥离出了`Session`

当抽象层级到了`socket`时 ， 代码就更长了， 可以看到`wrap`的`tls`， 循环接受响应， 二进制流，句柄的退出

再往下就是操作系统级别的编程了， 
传输层`TCP`与网络层的`IP`协议负责处理字符串的接受发送
`IP`连接不同的计算机，为`TCP`建立管道， `TCP`考虑数据在管道中的各种情况，丢包， 拥塞， 重传
链路层将数据传输到直连的机器， 直接涉及到硬件，网卡， 以太网端口

### 1.7 网际协议（IP）
计算机内部各个部件同样需要通信， 通信需要保障其会话不会被干扰

网络设备数据交换的基本单元为`packet`， 长度在几字节至几千字节， 
`packet`在物理层通常包含字节数据以及目的地址两个属性， 地址作为标识符

`IP`协议的设计抽象， 能让操作系统不需要去考虑数据在网络的如何被处理， 只负责发送、接受

### 1.8 IP地址
`IPv4`地址为`4`字节的整数，`.`分隔，如今已被用完， 当然要是没有`NAT`这类技术估计这一时间节点会更早来临

针对特定的场景， 有一些特殊的地址被预留下来
`127.*.*.*`预留给本机使用， 通常被用的只是`127.0.0.1`这一个，表示本机，开发测试中最为常见， 构成网络回环，亦可通过`localhost`访问

`10.*.*.*`、`172.16-31.*.*`、`192.168.*.*`预留给私有子网， 常见的场景有家庭，学校，工作单位， 云服务器上， 在场景内用此字段内的地址辨识机器， 出场景外会对应进行转换

### 1.9 路由
如何连接网络来传输数据到目的地址，这一过程为路由

已知的目的地址对主机来说，就相当是先验了
对本机地址`127`打头的地址就不需要过网卡这关
对私有地址也可以查询网段内信息， 不用到网关这一步

机器并不能识别`*`通配符， 通关掩码来遮盖已经确定的`bit`数
掩码的值一般为`bit`数， 第一个字节地址确定了掩码值就是`8`
当掩码为`30`，说明前三十位`bit`已被占用，只剩下`2`个`bit`, 最后的地址字节只有三个地址

### 1.10 `packet`分组
`IP`支持的最大数据包为`64k`， 而以太网传输的`MTU`只有`1500`个`Byte`，所以在实际传输过程中往往会将数据包进行切分，编号

分组的话，还是看具体的场景， 分组标记`DF`用于决定数据包是否分组
设置`DF`后， 将不会对数据包分组， 这时超出容量大小的数据包将会被丢弃， 失败后将有`ICMP`协议将错误信息返回给主机

`IPv4`地址未来将会被逐步向`IPv6`过渡， `IPv6`地址有16字节， 有多种表示方法， 常用的还是`16进制`的，`:`分隔

---
## 2. UDP
`IP`协议只确保路由能正确无误， 维持一个会话还需要两个特性
-    多路复用， 将数据包打上标签，会话两端的数据可以相互区分
-    可靠传输， 数据包，错误修复、丢失重传

`UDP`协议仅针对第一个特性， 对于丢包， 重包、乱序等错误还无法解决
`TCP`解决了这两个，但在性能上稍有劣势
通常在实时通信，允许丢包的场景比较适合`udp`， 此时的丢包并不影响下一刻
 `HTTP3`的`QUIC`协议为提升性能，也是基于`udp`进行改进
 
 ### 2.1 端口
 多路复用机制， 允许多个会话共享同一介质
 这里端口的多路复用， 是对会话建立完成的两台主机， 不同进程之间不串扰
 `HTTP2`的多路复用， 针对同一连接，将数据包分流， 发起多重请求与响应
 
 端口号的分配也有一定的惯例， `IANA`为主流服务都已分配了默认端口， 如`DNS`端口号为`53`
 端口号为16位无符号整数
 最重要、最常用的服务所分配的端口号，几乎都在`0~1023`， 这些端口号的监听就不要有想法了
 `1024~49151`通常都能任意指定， 一些大型服务的端口号可以当初默认的了， 尽量还是要绕开，如`mysql`的`3306`, `postgresql`的`5432`， 通常的`demo`测试常用的是`8080`，`8`开头之类端口
 
 `python`的`socket`模块有提供解析端口的方法
 `socket.getaddrinfo(), socket.getservbyname()`
 
 ### 2.2 Socket
 `python`的`socket`库实际上也是对操作系统`c`库提供的`socket`头文件进行封装
 `socket`是一个通信端点， 操作系统用一个整数来对其进行标识，
 
 `socket`涉及到的操作也只有读写操作，分别对应客户端的响应与请求、服务端的请求与响应
 我们实际接触的所有操作均是通过套接字来实现
 
 服务端与客户端进行`socket`编程的主要区别在于， 客户端通常是一次请求就退出程序， 服务端则是循环接受请求， 解析请求再针对性的返回响应
 当然，服务端还是要先初始化参数， 绑定端口， 客户端要解析域名，获取`IP`地址
 
`INET`协议族比`UNIX`的更具通用性
对`UDP socket`， 类型需选择`datagram`， 
`sock = socket.socket(family=socket.AF_INET, type=socket.SOCK_DGRAM)`

#### promiscuous
当未验证响应时， 攻击者可以轻易的伪装成服务端， 给客户端返回服务端应给的响应
将服务端代码挂起， 然后用另起一个脚本发送响应给客服端， 会发现客户端会轻易的退出
`windows`下`cmd`开启服务， 不易将其切到后台挂起， `unix`类系统可以`ctl`+ `z`, 或是在终端命令后加`&`, `fg`命令回切

#### udp的不可靠性
真实的网络环境中往往会伴随着包的丢失， 
数据报在传输时的有三种情形
-    即将到达
-     已丢失， 永不到达
-    对方已挂
客户端接收响应时需要以上的情形， 往往也得通过循环来接收
考虑到包可能丢失， 请求重发必不可少，因此, `socket`库提供了定时器方法`settimeout`,  当然， 多重请求对服务端也是一种负担

#### 连接
服务端显式监听端口， 客服端的隐式绑定由操作系统随机分配临时端口， `socket`对象的`connect`方法会缓存维持一个会话的信息， 不会混杂接受其他服务端的响应
对维护一个会话， 通常采用以下两种方法，
-    `sendto`与`recvfrom`指定对方地址
-    在同一个`connect`方法下进行`send`和`recv`， `getpeername`方法获取对方地址

#### 请求ID
给消息添加请求`ID`的好处在于， 可以应对重传带来的重包， 在一定程度上可以防范欺骗
响应针对请求`ID`添加上序列号，客户端就能加以区分

### 2.3 绑定端口
当服务端绑定本机的外部地址时， 客户端请求自环地址`127.0.0.1`是会被拒绝的，同一机器上操作系统会负责通知客户端， 而实际网络中的服务端就没有这么好心了
本地程序使用本机地址可以与任意服务通信

服务端绑定的地址可能会影响外部主机的连接

一台主机是启用的多个服务是可以共用一个端口的

服务端通常还是绑定的自环地址， 然后再通过边缘服务`nginx`进行反向代理， 可以防止外部的恶意数据

### 2.4 UDP分组
传输的内容往往要远大于`MTU`的`1500B`, 当`UDP`数据报大于`1500B`时， 数据报被拆分成多个小于`MTU`的
防火墙可以检测出会话传输的`MTU`大小

目前只有`linux`下， `setsockopt`方法才能对`MTU`进行修改
`setsockopt`可以设置一些网络配置， 如广播，路由等

如今多播已经发展的很成熟了， 广播的场景比较适合寝室断网不断电的时候跟室友联机了吧

---
## 3. TCP
### 3.1 TCP工作原理
`TCP`给每个数据包添加一个序列号，通过序列号来对数据包排序，检测丢失并进行重传， 序列号由字节数计数器实现， 初始序列号随机产生
`TCP`通过窗口来控制流量， 会根据网络情况来调整窗口大小

### 3.2 TCP场景
`TCP`几乎是互联网通信的默认选择， 

`TCP`连接的建立的三次握手， 以及连接断开的四次挥手
建立全双工通信，要求会话双方同步序列号， 所以握手至少需要三次， `SYN`、`SYN-ACK`、`ACK`
断开连接时，断开方仅关闭请求的发生，不断开响应接收，`FIN`、`ACK`、`FIN-LAST_ACK`、`ACK`

所以一次全双工的`TCP`会话至少需要7个数据包， 当会话需传递数据包极少时， `udp`会比较合适，
长时间的会话连接比较适合`TCP`

### 3.3 TCP的socket
对`udp`的`socket`， 在`connect`方法后`send`,与指定地址的`sendto`行为一致
而`tcp`的`socket`， 会话是建立在`connect`方法的状态之上的，`tcp scoket`的`connect`的建立可能会失败

`tcp`的`POSIX`接口分为主动， 与被动
被动的`tcp scoket`为服务端的`socket`， 它用来维护这个公共的`socket`接口， 由其通知操作系统来再分派`socket`与外部主机互联
主动的`tcp socket`只负责特定的主机间互联

### 3.4 TCP编程
`python`的`tcp`编程方法与`udp`差不多， 但底层的实现区别还是挺大的
`udp`对未启动的服务端发请求，抛出的是`ConnectionResetError`，而`tcp`请求则是`ConnectionRefusedError`

`udp`代码中需要手动处理丢包重传，超时等问题，  而`tcp`代码这部分就要显得简单些， 网络栈帮我们实现了这些

`udp`数据报是自包含的，只有`01`两种状态
而`tcp`要考虑分流， 存在部分传输的问题， 所以`tcp`代码会有循环检查请求长度的代码
```
sent = 0
while sent < len(request):
    req = request[sent:]
    sent += sock.send(req)
```

被动`socket`的`accept`方法返回操作系统分配的主动`socket`与该`socket`的信息， 当调用其`listen`方法时， 将造成该被动`socket`无法交互任何信息
`listen`方法接受的整型参数表栈中的最大等待数

被动`socket`的`SO_REUSEADDR`属性， 该属性可以保证服务挂掉重启时，上次绑定的地址能快速重用

### 3.6 死锁
`tcp`会话的两端有操作系统分配的缓冲区， 用于缓存还未来得及处理的消息， 服务端->客户端，未收到的响应， 客户端->服务端，未收到的请求
当缓冲区被占满， 消息传递的方法会被阻塞， 然后进程会被操作系统暂停

避免此类死锁，常用的两种方案
1.    将会话两端的`socket`设为非阻塞， 缓冲区满时消息传递的方法会主动返回
2.    读写操作的并行，或是一些异步的操作系统调用

`udp`没有流量控制， 无此现象

### 3.7 半连接
`socket`句柄与文件句柄一样，当句柄指针到达句柄末尾的`SEEK_END`时，继续再读就返回空值了

阻塞`socket`不受会话某一端的断开影响， 非阻塞`socket`则需要别的手段来检测`socket`状态

`shutdown`方法在保持`socket`状态的同时，关闭一个方向的通信， `SHUT_RD`、`SHUT_WR`、`SHUT_RDWR`,选择关闭的方向， 

`shutdown`方法与`close`方法的不同， `shutdown`方法关闭该`socket`与所有相关进程的连接，`close`方法仅关闭该`socket`与当前进程的连接

单向`socket`不能直接实例化， 通常需创建一个正常的`socket`然后再调整方向， 对关闭连接的某个方向， 操作系统不同无意义的填充其缓冲区

`makefile`方法返回`socket`版本的句柄

---
## 4. `socket`与`DNS`
### 4.1 主机名与`socket`
创建`socket`至少需要`3`个参数， 
构造器参数,     
-    地址族,`AF_INET`最为通用， `AF_UNIX`适合本机内， 连接的是文件名
-    `socket`类型， 根据数据包的类型区分， `udp`的`SOCK_DGRAM`， `tcp`的`SOCK_STREAM`
-    协议， 上面两个参数确定后， 可选的协议就没多少了， 这本书只用到了`IPPROTO_TCP`、`IPPROTO_UDP`

### 4.2 地址解析
`getaddrinfo`方法解析地址、域名， 返回`socket`的相关参数`[(AF, socket-type, ipproto, '', (ip, port))...]`, 用于构造`socket`， 服务端绑定， 客户端服务连接

利用`getaddrinfo`方法解析某一服务在指定数据传输方式下的地址， 0为数字字段参数的通配符
```python
socket.getaddrinfo(
            hostname_or_ip, 'www', 0, socket.SOCK_STREAM, 0,
            socket.AI_ADDRCONFIG | socket.AI_V4MAPPED | socket.AI_CANONNAME,
            )
```

根据需求，给`getaddrinfo`方法传不同的标记, 可以获取更多的地址信息， 实现更复杂的功能， 例如进行反向`DNS`查询等


### 4.3 DNS
`TCP/IP`为不同`ip`地址的建立会话，但`ip`地址并不适合记忆， 以及在大型的分布式服务上， `ip`不适合对服务进行标识
域名与`ip`是一对多的关系

对域名的解析， 须指定`dns`服务器，  `dns`服务器负责响应域名与`ip`地址间的映射, 

`dns`请求为`udp`报文， 因为其报文为低频短文本内容， 

而`dns`并不是唯一获取域名信息的方法， 操作系统有对应的机制`hosts`，会进行一定的缓存
`dns`请求也是由近及远， 本地的`dns`服务器通常经管理员配置， 手动或是`DHCP`， `python`很可能已有本地`dns`服务器的信息

---
## 5. 网络数据和网络错误
### 5.1 网络字节顺序
很多协议的数据在网络中会转换成文本串传输， 到达目的地后再被解析，例如一个整数会经历`itoa`, `atoi`

即使是字符串，实际传输的还是二进制的`byte`,网络字节顺序主要是指的跟机器相关的大小端对齐问题

`POSIX`接口的字节顺序转换接口为网络顺序转主机顺序的`ntohl`、主机顺序转网络顺序的`htons`

`python`这`struct`模块用于处理数据及其二进制表示的各种操作
`pack`、`unpack`函数，可以根据`<(>)i`对数据进行大小端的二进制转换

### 5.2 封帧与引用
在`POSIX`标准下收发`TCP`报文需要用`while`循环收发数据包，
`python`中对发送报文封装了`sendall`方法，却并未提供`recv`的对应封装

确保消息完整安全传输
-    先完成一个方向上的数据传输， 然后再完成另一方向上流的数据传输， 同时双向的数据流动， 数据量大到一定程度就容易造成死锁
-    `recv`定长报文
```python
def recvall(sock, n):
    data = ''
    while len(data) < n:
        more = sock.recv(n - len(data))
        if not more: raise EOFError(f'socket closed {len(data)} bytes into to a {n}-bytes message.')
        data += more
    return data
```
-   消息的字符集合有限时， 用分解符划分消息边界, ``、`xff`
-   对每条消息增加一个前缀字段， 描述其长度
-   对每个数据块加上长度前缀， 以及消息的结束标志

`pickle`的分隔符为`.`

跨语言标准，  `json`通过字符串表示，其标准要求用`utf8`编码， `xml`对文档更为适用， 二进制`protobuffer`

`zlib`压缩能识别出压缩数据何时到达结尾， 其后未压缩数据亦可访问

### 5.6 网络异常
涉及到`socket`操作的常见异常
-    `OSError` 最常见，当`send`方法让远端发回一个`RST`响应，接下来`socket`相关的任意操作均会抛出次异常
-    `socket.gaierror`, `getaddrinfo`方法解析不到地址时抛出
-    `socket.timeout`

异常在会话中产生时， 不易定位异常的位置， 这时需要手动继承`Exception`扩展自定义异常类， 帮助定位具体异常的位置

---
## 6. TLS/SSL
### 6.1 TLS无法保护的信息
`tls`加密的内容包括`https`会话的连接，以及响应内容、密码、cookie及认证信息

始终透明的信息有， 参与会话两端`ip`的地址信息， 端口号、`DNS`查询信息
会话外的第三方可以轻易的知道 数据块大小、会话的整体模式，区分出请求与相应， 已经数据的顺序

证书通常需要第三方的认证机构， 对个人的小型应用服务可以到`letsencrypt`申请免费的`CA`证书

### 6.4 `tls`负载移除
要在`python`应用程序中提供`tls`支持通常的做法
-    用一个单独的守护进程/服务来提供`tls`， 易于修改与升级
-    在服务端代码中添加`ssl`库的加密功能， `ssl`还不支持`ECDSA`签名

### 6.5 默认上下文
`ssl`模块的`create_default_context`函数用于初始化`tls`
```python
purpose = ssl.Purpose.SERVER_AUTH  # server side use CLIENT_AUTH
context = ssl.create_default_context(purpose, cafile)

# server side
context.load_cert_chain(certfile)

context.wrap_socket(raw_sock, server_hostname=host)
# server side
context.wrap_socket(raw_sock, server_side=True)
```
服务端需要加载私钥， 然后用其`wrap_socket`方法把`socket`包一层就有了加密功能

`tls`可以加密会话的连接在于`https`连接后可以直接激活`tls`,  其`tls`协商是在连接建立之后完成

`smtp`协议的连接需明文来建立， 故对`smtp`内容加密时不能提前`wrap`好`socket`

`https`虽然可以提前`wrap`好`socket`， 但`connect`、`accept`方法在协商时异常会失败， 其次实际的加密功能是在连接已建立、显示调用`do_handshake`关闭自动协商的时候

### 6.6 选择加密算法与完美前向安全
考虑到向下兼容，默认上下文对数据的加密级别较为一般

前向安全问题指的是在时间节点之后获取早期的私钥对早期加密数据的破解， 目前椭圆曲线算法`ECDHE`能提供有效的加密
只有服务器定期丢弃维护的会话状态与密钥才能保证`PFS`

可以对上下文属性进行手动设置`context.options |= ssl.option-name`， `set_ciphers`方法设置加密算法，来要求客户端更新匹配的加密算法

主流协议几乎都支持`tls`, 对旧的普通协议进行扩展， 可以在会话中为其升级`tls`加密， 或是转换`tcp`的通用端口号， 会在连接建立后自动开始`tls`协商， 
由于`http`的无状态， 仅支持修改`80`端口至`443`端口

`ECDHE + RSA + AES128 + GCM + SHA256`为当前`openssl`能够提供的最佳加密方案

---
## 7. 服务器架构
### 7.1 部署
对单机的网络服务而言， `ip`之间直连建立会话就能提供服务， 单机多服务，对不同端口、不同记录值， 可由`nginx`统筹来转发
对分布式的多机服务， 主流做法还是在服务边缘配置`nginx`的负载均衡， 实现反向代理，对用户隐藏实际的服务， `dns`会返回离用户最近的负载均衡站点

旧式的单体架构部署下，每个服务器实现其服务的所有功能， 然后创建`daemon`，安排相关的日志，配置文件，不同的状态应对机制
目前流行的微服务下的`twelve factor app`，只实现服务器其必备功能的最小集合， 可以通过环境变量连接任意后端

还有应用`PaaS`、`SaaS`的网络服务， 借助平台的托管功能，单个服务可仅实现单个功能

### 7.3 单线程服务器
单线程下， 同一时钟频率，服务职能应对一个会话， `listen`参数大于`0`也只是将多个连接放入队列中

`trace`模块屏蔽标准模块输出， 监控每行代码运行时间
`python -m trace -tg --ignore-dir=/usr`

在关闭`socket`前，第一次后的`recv`方法的调用的结果返回会有延迟， 这是由于操作系统在`tcp`层的优化， 握手时就已经包含消息文本， 第一个`recv`尚未调用时已经有数据在缓冲区，`send`方法只要将消息推到缓冲区就返回

### 7.4 多线/进程服务器
进/线程区别在于是否共用相同的内存空间， 切换开销
`python`的多线程由与`GIL`而无法为每个线程分配独立的计算资源
进程间切换的时间开销远大于线程间

不绕过`GIL`的`python`的多线程只能分配单核，资源的利用率低
多线程下， `cpu`针对每个线程申请的时间片来多路复用
操作系统会为每个线程分配调用`listen`方法的`socket`副本， 然后运行该线程下的`accept`

多进程下， 进程间的内存空间相互独立， 隔离性强， 增加操作系统负担， 也降低了崩溃的概率

#### 7.5 异步服务器
现代操作系统网络栈支持异步编程在于
-    网络栈可以提供系统调用，阻塞整个`socket`的连接池，
-    允许`send`,`recv`读写操作立即返回， 延迟时准备好交互重试的环境

目前`POSIX`异步非阻塞的网络编程主要是通过`epoll`， 支持高并发， `nginx`就有用到

`select`模块封装了操作系统的`epoll、 kqueue、poll`接口，`win32`下只支持`poll`， 要实现一个基本的异步网络服务， 需处理好`poll`状态机的各个状态
可以用`generator`模拟无限长容器， `dict`来代替操作系统上下文的切换
对`accept`返回的`socket`， `setblocking`方法设置其非阻塞

`asycio`框架支持回调、协程两种风格的异步编程， 可在仅扫描`socket`的情况下完成与不同客户端会话直间的切换

### 7.6 `inetd`
开启`inetd` `daemon`服务仅需修改`/etc/inetd.conf`配置文件即可，`inetd`为每个端口调用`bind`、`listen`方法， 

每当会话建立时会启动一个进程，设置`nowait`后会在连接关闭后保留其进程的监听状态
`port stream tcp nowait user interpreter interpreter script.py`
此时，脚本需不断调用`accept`来保持忙等待，以接受客户端发起的请求

将`python`的标准`IO`流设置为文件流, 不过这并非对实际的`fd`进行操作， 当服务器调用`C`库则需要关闭`fd 1,2,0`
`sys.stdin = open('/dev/null', 'r'); sys.stdout = sys.stderr = open('log', 'a', buffering=1)`

---
## 8. 缓存与消息队列

### 8.1 Memcached
`key-val`类的主流`NoSql`主要是`memcached`和`redis`
虽然现在`redis`比`memcahced`还要火一些， 但解决的问题还是类似的
主要是针对服务器响应慢， 缓存中间件， 将相对独立的数据部分孤立出来， 可供多端使用， 缓存内容均为可恢复可重建的计算结果

跟硬件层的`L1、L2、L3 Cache`差不太多， 当寻址未命中再向上一层级寻址，`redis`则是软件层， 结果键值为命中，再重新计算

实现是基于`LRU`的一个超大型哈希表， `pyhton`调用`memcached api`会自动触发`pickle`操作， 缓存的的是二进制`pickle`序列

针对时效性的缓存
-  `memcached`可以为每个键值设置`timeout`
-  可以建立信息标识与键的映射， 通过映射实现值的更新

### 8.2 散列与分区
`memcached`服务为网络应用提供数据接口， 客户端对获取的多个`memcached`实例， 可以通过键的字符串`hash`值对`sql`分区， 来定位数于据其服务器集群的位置

客户端缓存相关的信息仅需要`key`与服务器列表， 相同的`key-val`应仅存储在同一机器上

选择`hash`值来进行分区的好处在于， 好的哈希算法能保证结果的均匀分布， 能独立于输入字符串的分布情况， 从而达到负载均衡， 书中案例为单词首字母分区


### 8.3 消息队列
目前常见的有`rabbitmq`，分布式的`kafuka`， `redis`的键值存储也可以用作消息队列

消息队列负责封帧，保证消息的可靠自动传输， 不需要循环调用`socket`的`recv`方法， 能统筹多端的`C/S`服务，并确保消息准确无误

消息队列可支持客户端之间的拓扑扩展模式，
-    管道， 队列随着站点的繁忙而变长
-    `publisher-subscriber`、`fanout`
-    请求-响应,  可运行大量的轻量级线程


使用场景
-    用邮箱注册账号，服务端发送确认邮件，会先将邮箱放入一个消息队列， 走`SMTP`协议时从消息队列中取出邮箱对象， 发送失败会将邮箱重插入消息队列中
-    `web`服务器繁忙时，通过`rpc`将`cpu bound`的任务置入消息队列供多个后端服务器监听
-   将大容量事件数据切分为小型消息流进而分析，  消息队列替代了日志系统、`syslog`之流的日志传输机制 
-   秒杀、抢单、抢票系统

![publisher-subscriber](https://wuchengwei.icu/wp-content/uploads/2020/07/publisher-subscriber-300x192.png)
本书中的`zmq`，已经很老了额， 用蒙特卡洛方法估算圆周率， 点落入四分之一单位圆与矩形的概率比， 
案例中消息队列为`always_yes、judge`， 过滤并接收服务端`b`的数据流， 计算以`rpc`形式推给应用端`p`， 结果推给客户端`t`

---
## 9. HTTP客户端
`http`用于获取与发布文档、 包括但不限于图像、`pdf`、音视频、`html`

### 9.1 客户端库
`requests`模块，基于`urllib3`的连接池

`gunicorn`为基于`wsgi`的`web server`容器， 通常用于`python`的`web`服务部署， 可以配合`flask`等框架
`httpbin`是一个小型的测试站点模块， `gunicorn httpbin:app`运行测试站点

### 9.2 端口、加密、封帧
当客户端也提供证书时， `tls`是允许服务器对客户端进行身份验证的， 当`Host`字段与证书不匹配， 客户端会被拒绝， 所以`http1.1`的请求首部必须包含`Host`字段

`http1.1`的请求在未收到响应时， 是不允许发送第二条请求报文的
请求报文包括三个部分，  用`rn`进行封帧， 尽管有封帧， 大多服务器还是会在读取请求时设置长度限制
-    方法，路径，协议 `GET / HTTP/1.1rn`
-    `key-val`, `Host: wuchengwei.icurn`, 最后一个键值对后面还需要一组额外的`rn`
-    消息体(可选)

对消息体的封帧方法有
-    `Content-Length`字段指定消息体长度信息
-    `Transfer-Encoding`字段设为`chunk`，进行更为复杂的传输层封帧手段， 块中就带有长度前缀， 16进制
-    `Connection: Close`，可以发送任意大小的消息体，此举无法判断连接关闭的缘由， 每个请求都需建立连接， 降低了协议效率

### 9.3 方法
大都是`GET`、`POST`的变体
`TRACE`用于调试， `CONNECT`用于协议的切换，并不涉及数据传输

### 9.6 缓存与验证
与其他网络服务一样， 缓存能大大提高效率， 浏览器客户端可以将页面持久化， 你会发现，有些网页即使断网了有时还是能打开其首页，
浏览器缓存的时间控制通常采用定时器`Cache-Control:max-age=3600`，`Vary`字段可以设置不同级别的缓存
每次使用缓存前应发送条件请求，验证缓存的时效性， 
-    `Last-Modified`字段记录服务上次更新的时间点，与其缓存的时间对比
-    `IF-None-Match:UUID`与`ETag`

对同一路径， 针对不同用户返回不同结果， `Cookie`是最常见的选项，

### 9.7 传输编码
旨在提升传输效率， 压缩传输文件体积
客户端在`Accept-Encoding:gzip, defalte`字段中告知服务端编码的可选方法、服务端响应的`Transfer-Encoding`字段给客户端以确认

### 9.8 内容协商
内容协商可以根据用户的一些属性来针对性的返回不同响应， 最为直观的就是语言了， 对不同地区的用户， `Accpet-Language`通常会获取位置信息， 然后返回对应语言版本，
`q`参数为权重参数

`http`客户端的`api`往往难控制`Accept`这类字段， 所以内容协商在一定长度上容易被忽略， `requests`中接受此类字段通过`Session`

### 9.9 内容类型
`Content-Type`字段通常为为服务端接收`Accept`字段信息后对应的响应体文本类型说明，

在多数据类型的`Post API`中,  `Content-Type`声明上传数据类型， 获取对应的响应

### 9.10 http认证
授权错误码为`401`， 但通常会返回`303`的状态码， 认证信息需要单独传输

没有网络库完整实现协议的，`requests.Session`的`auth`等其他设置， 也只是减免了`Authorization`字段所必要的`base64`编码操作

### 9.11 cookie
目前主流认证机制使用的是`cookie`， 包括统一主机内的`Ajax`

`secure`属性防止客户端在非加密请求携带`cookie`

`cookie`还往往被服务端用作跟踪用户的工具

`requests.Session`会自动进行`cookie`的跟踪

### 9.12 连接复用
随着`tls`的时间成本， 连接的反复建立也是巨大的时间损耗
`Keep-Alive`字段可以在客户端下载多个资源的时候对初始连接的复用

`requests`中的连接池会缓存最近的会话状态，以实现连接的复用

---
## 10 http服务器
`python`的`stl`内置有一个上世纪90年代版本的服务器， 其请求路由会被直接转换成文件系统中的搜索路径， 仅支持服务挂载下的目录， 对目录的访问会定向到存在的`index.htm`
现代的`http`服务几乎都会用上`nginx`反向代理， 负责路由的转发， 可以映射到任意目录

### 10.1 WSGI
`python`早期的`http`编程通过`CGI`、`http.server`来实现， `CGI`针对每个请求新开进程，而且可移植性很差

针对`http`编程的弱势， 在`PEP333`中提出的`WSGI`标准，现代的`python3`的`WSGI`标准则对应`PEP3333` 

`WSGI`程序的实现也是回调风格， 两个回调参数分别是`CGI`环境变量集合拓展的字典`environ`、 声明响应头部信息的`start_response`， 当服务`app`函数为生成器时，可在迭代中生成字节序列

`WSGI`中间间的优势在于其提供的可插拔性， 服务与框架、应用程序间

### 10.2 异步服务器与框架
`WSGI`还尚未支持基于协程、语言运行平台调度线程的异步服务器， 任然是面向传统的并行服务器， 任然存在`IO`阻塞

`WSGI`不能将可调用对象的控制权返还给主进程， 以至于主进程不能直接对其调度

不同的框架通常会设定不同的编程规范， 诸如，`F`家的`Tornado`， 大名鼎鼎的`Django`， 轻量级的`flask`

### 10.3 前/反向代理
代理其实也是一个服务器，  根据它充当的角色不同归为前/后向， 前向是充当客户端，反向则是充当服务端

随着`TLS`的普及，前向代理实施的难度变大了了不少， 仍存在的应用有科学上网代理， 扮演用户去抓取外网数据， 然后中转回内网

反向代理的广泛使用，已经是`web`服务的标配， `Expires`、`Cache-Control`字段标识缓存状态， 反向代理在缓存有效期内充当服务端， 承载大多数负载

反向代理服务器会先获取服务端的证书、私钥， 然后截断`TLS`，  让服务端不可见

### 10.4 四种架构
`python`社区中4中最基本的设计模式，
-    服务器代码直接调用`WSGI`的`api`，  服务器引擎可以选择`gunicorn`,  若是实现异步服务器， 服务器与框架须在同一进程
-    配置`mod_wsgi`中间件， 静态资源由`C`引擎直接返回， 动态资源由`mod_wsgi`开启`deamon`->`pyhton`脚本, 不适用异步框架
-    后端`gunicorn`， 前端`nginx`反向代理， 我的个人站点采用的是此方法，再配上`flask`框架
-    上一种架构的最前端再添加一层纯粹的反向代理`Varnish`， `Varnish`可经由`Fastly`之类的`cdn`加速请求资源响应的返回

`Apache`服务器如今已经不再是服务边缘的首选了， 其性能各方面已被`nginx`碾压

反向代理的优势在于， `nginx`会对请求进行高效的预处理， 如长时间未响应的请求、畸形输入等， `nginx`会主动决绝无效请求
首选方案应为`nginx`+`gunicorn`, 纯`api`可只用`gunicorn`， 必要时配上`Varnish`充当一级缓存， 大型服务就第四种的三层架构

### 10.5 平台即服务
`PaaS`平台通常会提供负载均衡、版本控制、数据库管理、容器及其缓存等功能，开发者可以无需自己故障重启、`DNS`配置、环境配置，负载管理，但仍需`web`服务器来给程序提供监听端口

### 10.6 GET、POST模式和REST的问题
`rest`的4个约束条件
-    `URI`标识资源
-    通过其表示形式操作资源；`restful`的`http`协议可以区分读写请求
-    消息的自描述性； 请求首部字段
-    超媒体 -> 应用状态引擎； 一般的`api`很难满足该约束
与`rpc`最直观的区别在于第一约束， `rpc`在应用层协议未暴露资源实体，是没有`uri`的路径的

### 10.7 不使用`web`框架编写`wsgi`可调用对象
`web`服务器负责监听端口， 可以不调用应用代码即可解析请求

`web`服务器只会将完整的请求递交给框架、应用代码

框架的作用主要是路由， 分发`url`， 对不支持的`http`请求会自动返回异常的状态码

不用框架来进行路由
-    通过`wsgi`入口`environ`变量的字段， 条件判断来过滤筛选路由
-    三方库的`wrapper`， 如`webob`、`werkzeug`,  也是对`environ`变量进行封装，简化过滤

`flask`是基于`werkzeug`构建的框架，同一作者

---
## 11 万维网
### 11.1 超媒体与URL
`web`的意义在于用机器实现对引用资源的寻址， `http`协议是为实现`web`而设计的

`uri`是更为广泛的概念，是`url`的超集， `uri`指代计算机可识别的概念性实体， 为其指定的名字为`urn`

更为完整的`url`组成， 协议的字段名为`scheme`
`scheme://(auth)@host:port/path?key=val&key1=val1#fragment`

#### url解析
`urllib3`的`parse_ul`接口通过正则几乎已将所有情况均考虑在内了， 返回包含各个字段的元组
`scheme, auth, host, port, path, query, fragment = parse_url(url)`

### 11.2 超文本标记语言
`html`已经到第五代标准了， `css`标准也到了第三代， 交互的脚本语言`javascript`的`es`标准也更是到了第十版， 虽然目前主流应用还是`es6`, 还需要考虑兼容`es5`，不过版本的升级更多的是弥补前代的不足已经对未来的展望， 经时间检验过的优良部分可定会被继承， 虽然形式可能会发生变化

静态页面没有数据绑定， 所有用户获取的均是相同的内容， 可由各个结点的`cdn`服务器加速内容响应返回

动态页面随用户的不同而不同， 随交互的不同而不同， 需绑定数据， 会用到字符串模板引擎， 将更新的绑定数据实时渲染到模板中达到动态的效果

### 11.3 数据库读写
根据应用的数据类型，选用对应的数据库进行管理数据， 然后就可以开启枯燥的`CRUD`生活了

`python`内置有便携式的轻量级数据库`sqlite`， `sqlite`更适合数据规模小， 与应用绑定的场景

对中小应用、服务，最为广泛使用的关系数据库是社区办的`mysql`，免费，开源
`NoSql`中的`key-value`数据库，有如`redis`、`memcached`,  结构化`value`的`MongoDB`，社交网络、推荐系统中图结构数据库`neo4j`

### 11.4 flask账单web应用
才发现`jinja2`的作者也是`flask`的作者
`{{}}`绑定数据， `{% %}`循环， `{% set express %}`简单计算

### 11.5 表单与`HTTP`方法
`get`方法的表单会把字段添加到`url`，作为请求路径， 所以不能用`get`方法传输密码等敏感信息

`post`、`put`、`delete`方法会将字段放至消息体中， 路径不发生变化， 因此可受`tls`加密

上传大型负载可以基于`MIME`标准的表单编码`multipart/form`

`post`请求会造成状态变化， 浏览器会谨慎的对待， `post`请求下的页面重载浏览器会弹窗提示以确认， 为防止重载这时的弹窗, 通常有两种方法
-    用`js`来检查以确保用户的输入准确
-    表单提交后重定向页面

访问地址时使用`get`方法， 状态修改使用`post`

#### cookie
`cookie`为用户的验证信息， 服务端通过`cookie`来记录用户的先前会话状态， 当`cookie`被攻击者获取会造成极大的安全隐患

常用的用户名混淆方法有， `Base64`编码， 字节顺序交换、 常量掩码的异或操作

保证`cookie`不被伪造的`3`种方法
-    使用数字签名对`cookie`签名， 可保留`cookie`的可读性，密钥和源代码需保存在不同位置
-    完全加密
-   用`UUID`库创建随机字符的`cookie`

### xss
跨站脚本通过注入`js`脚本来劫持请求， 这时的应对手段是将标签标记`</>`进行转义

 非持久`xss`将脚本置于外部，需用户手动触发，当误点了攻击者的入口连接， 请求字段会按攻击者的意愿被修改， 单次触发
 
 持久`xss`则是将脚本注入到服务器， 这种攻击在每次访问页面就会被触发
 
 #### csrf
 跨站请求伪造主要发生在表单字段被攻击者摸清， 任何用户会访问的站点， 只要有攻击者注入的脚本， 都会在无形中发送`post`请求提交表单
 应对`csrf`可以增加提交、构造表单的难度， 如增加额外的隐藏字段信息、隐藏表单属性
 
### 11.6 Django账单应用程序
`django`是全栈式的`web`框架， 内置有`ORM`、模板引擎、`CSRF保护`， `flask`则需要配合`sqlalchemy`， `django`内容需要新开贴了
有名气的`python` `web`框架还有 `Tornado`、`Bottle`、`Pyramid`

### 11.8 websocket
`websocket`协议用来解决长轮询问题，`wsgi`不支持`websocket`

`websocket`会话建立与`http`类似， 然后通过请求字段与状态码协商，转换为`websocket`协议

`websocket`的帧数据系统与`http`区别较大， `websocket`下的`socket`可以同时双向发送消息

`websocket`编程有着大量的交互操作，`js`与服务端直接

`websocket`主要用于多端的实时交互， 如多人聊天室，群聊， 服务状态实时更新

### 11.9 网页抓取
`robots.txt`，站点的抓取限制， 服务条款

获取页面常用的3种方法
-    `requests`， 维护`cookie`、连接池的`Session`
-    `selenium`， `webdriver`，仿人交互
-    `mechanize`， 已不更新， 介于浏览器与`python`间

`html`解析库`beautifule soup4`
`lxml`比`bs4`要快不少，而且还提供多种选择元素，`xpath`、`cssselect`

---
## 12 电子邮件构造与解析
`email`相关的协议
-    `SMTP` 将邮件推送至`@`后的域名服务器， `25`端口
-    `POP3` 下载服务器邮件至本地，  `110`端口
-    `IMAP` 本地浏览服务器邮件， `143`端口

本章的内容为以上三个协议的基础

### 12.1 `email`格式
`RFC 5322`是现行的`email`标准
-    `email`以`ascii`文本形式表示
-    行尾标记由`CRLF`组成`rn`
-    一个`email`包含一个邮件头、空行、邮件体
-    邮件头由多个`key-value`组成, `key`是`caseless`， `value`一行容纳不下后续行需要缩进`t`， 

邮件头会记录邮件的基本信息， 收发方、路径、抄送、密送、日期、`id`、回复等

### 12.2 构造`email`
`date`、`message-id`是邮件头中必须手动设置的， 编码、类型、`MIME`版本都有默认值

构造一个最基本的`email`
```python
from email import message, policy, utils
import sys
msg = message.EmailMessage(policy=policy.SMTP)
msg['date'] = utils.formatdate(localtime=True)
msg['message-id'] = utils.make_msgid()
msg.set_content(text)
sys.stdout.buffer.write(msg.as_bytes())
```

`message-id`可以采用`uuid`算法生成标识， `set_content`、`as_bytes`方法对邮件体进行格式转换

### 12.3 添加`HTML`与多媒体
`mime`标准为`email`非`ascii`提供扩展， 在`content-type`指定一个边界字符串， 用此边界将`email`拆分为多个子部件

边界字符串的标准是把开头设置为连字符， 然后可以给子部件也添加邮件头， 这样形成了邮件的嵌套结构

`email.message.MIMEPart`对象用来构造子部件实例， 指定其邮件头、邮件体， 然后父部件的`attch`方法添加子部件， 手动构造`mime`的场景比较少见

通常在构造`email`主部件时就可以构造`mime`， 涉及到的4个方法
-    `set_content`  
-    `add_related`， 添加引用， 主消息体的必要资源， `html`主消息所需的`css, js, img`
-    `add_alternative`， 为适配多端，提供备选消息体， 同时将`message-id`配合连字符来拆分父子部件
-    `add_attchment`， 消息附件

引用资源也为子部件，故添加引用时也需要生成`uuid`标识

`add_alternative`格式化分割字符串， 连字符目前是采用的`--===============id==`, 分隔符会用作子标题，对子部件的每个消息进行标识

`mimetype`模块的`guess_type`函数可以对文件的`mime`类型及编码进行解析， 但无法解析八进制流,  所以解析失败的类型会被置为`application/octet-stream`

`multipart/*`的邮件消息使用边界字符串对`mime`分割， 作用在于分割某条消息的多个版本
对`multipart`字段
-    当调用了`add_related`方法， 生成`multipart/related`类型子部件,  内容涵盖`set_content`方法中指定的所有相关内容
-    当调用了`add_alternative`方法， 生成`multipart/alternative`类型子部件， 内容包含原始邮件及其衍生版本
-    当调用`add_attachment`方法， 生成`multipart/mixed`类型子部件， 内容为所有附件

### 12.4 内容规范
构造`mime`的4个方法也有对应的调用规范
 -    内容为字符串时， 默认类型都是`text/plain`, `subtype`参数可以将文本指定为`text/html`
-    内容为`binary`时， `type`参数指定类型文件`image`， `subtype`指定具体类型`jpeg`， 
-    内容的编码若仅用`7`个`bit`即可就会采用`ascii`，不够则会采用`base64`编码，`base64`的缺点在于不可读，`cte`参数用来覆盖编码 如`quoted-printable`，指定后，会对长字节的字符进行转义替换,  这样会就不会出现大量的`base64`编码
-    引用内容的`cid`参数， 需要包含在`<>`内

### 12.5 `email`消息解析
用`EmailMessage`的内置方法时，邮件需按字节读取， 然后用`email`模块处理， 比起手动解析， 这样的好处在于避免解码

`email`模块的`message_from_binary_file`负责将二进制字节转换为`EmailMessage`对象， 
`get`方法获取邮件头的`key-value`,  `get_body`方法指定优先级参数`preferencelist`获取邮件体，
在新版本`python`中的`iter_attachment`方法可以捕获附件，  `3.4`版本的`python`对有附件的消息体，附件的多媒体消息扔需手动搜索，`walk`方法遍历再进行逐个判断

### 12.6 遍历`mime`部件
在使用`EmailMessage`方法实际解析的时候， 邮件体中包含不可打印信息、格式/编码错误时，邮件体对象可能会获取失败， `python`的解码错误会抛出`UnicodeError`类异常，然后退出程序， 

手动解析`email`要牢记4个基本准则
-    子部件的读取，需先调用`is_multipart`方法来判断此`mime`部件是否仍为嵌套结构
-    对`multipart`部件，`iter_parts`方法可以获取其子部件
-   `content-disposition`字段用来标识部件是否为附件
-   主类型为`text`的`mime`部件内容，`get_content`方法解码得到的是`str`的文本，`text`以外的主类型均解码为`byte`

之前流程python看的协程都尼玛忘了， 动手实践少了点， 又没有记录、输出 后面重看`流畅都python`再慢慢补上
```python
def walk(part, prefix=''):
    yield prefix, part
    for i, subpart in enumerate(part.iter_parts()):
        yield from walk(subpart, prefix + '.{}'.format(i))
```        

### 12.7 邮件头编码
`email.header`模块的底层实现， `Header`类有邮件头编码方式的详细实现

### 12.8 解析日期
`email.utils`的`formatdate`函数默认返回当前的时间日期， 亦可接受底层的`unix`时间戳， `format_datetime`函数来接受`datetime`的事件对象

`parsedate`、`parsedate_tz`实现`formatdate`的逆向操作， 返回表示时间的元组， 遵循`c`旧式风格时间

`parsedate_to_datetime`则返回一个完整的`datetime`对象

`pytz`模块支持对时间的运算

---
## 13 SMTP
`rfc 5321`是`SMTP`目前最新的标准
提交和传输`email`时使用的`smtp`稍有不同

### 13.1 `email`客服端与`web`邮件服务
个人主机的`25`端口通常会被`isp`禁用，故不能被部署为邮件服务器， 这样的目的是防止其被病毒劫持

提交`email`由本地客户端发起，经过认证后，发送至`tls`协商`starttls`的`587`端口， `465`端口则要求在`smtp`启动前进行`ssl`加密
提交后的`email`在服务器之间多跳传输(多重`dns`路由， 垃圾过滤， `ldap`映射)，此时的端口是`25`，且无需身份认证

如今的`email`客服端已经很大程度上被`web`给取代了， 浏览器集成了`email`必备的协议栈

### 13.2 `smtp`的用法
`email`从客户端提交邮件至服务器需要身份认证， `eamil`在服务器间传输可能会失败， 
因此邮件往往需要如`postfix,exim,qmail`的`mta`代理重传队列，负责在`email`传输失败时，将`email`再添加队列中

对一个`smtp`会话， 邮件头的收发字段相互独立，`email`在客服端提交前，邮件头会被再编辑， 如删掉密送字段， 添加辅助的`id`字段等，
这样可以达到对消息体的复用，实现订阅的发布

### 13.3 `smtp`模块
```python
import sys, smtplib

message_template = """
To: {}
From: {}
Subject: test

hello from wcw
"""

def email_demo():

    server, fromaddr, toaddrs = 'localhost', 'wcw@test.com', ['344078971@qq.com',]
    message = message_template.format(', '.join(toaddrs), fromaddr)

    connection = smtplib.SMTP(server, port=25)
    connection.sendmail(fromaddr, toaddrs, message)
    connection.quit()
```

`python -m smtpd -c DebuggingServer -n localhost:25`
运行`python`内置的本地邮件服务`debugger`， 捕获本地`SMTP`发出的邮件信息， 真实场景跨域m, 需实现加密，认证等操作


### 13.4 错误处理与会话调试
`smtplib`的常见异常
-    `gaierror`, 查询地址错误
-    `error`,      网络、通信错误
-    `herror`,    地址异常
-    `SMTPException`，  会话异常

前三种异常由`os`级的`tcp`抛出， `python`负责捕捉后由`smtplib`打印出来，`tcp`正常连接情况下抛出的异常即为第四种
`SMTP`实例的`set_debuglevel`方法设置后能打印更详细的信息，如一些`email`协议命令，`ehlo、rcot to`等

### 13.5 从`EHLO`获取信息
`stmp`服务器往往都对消息大小有限制， `EHLO`命令支持`smtp`扩展集`esmtp`， 能协商会话双方的`smtp`特性， 

`SMTP`实例的`ehlo, helo`方法返回的状态码与`http`的类似， 值在`200-300`之间时，`SMTP`实例的`esmtp_features`字典属性将会保留协商的结果

### 13.6 使用`tls/ssl`发送`email`
`smtp`与`http`为同级协议， `smtp`会话的建立在两端协商之后，  支持`ehlo`是`tls`的必要条件

`ehlo`验证过后,`SMTP`实例需调用`has_extn`方法确认`esmtp_feature`属性中的`starttls`字段， 该字段也是`smtp`建立`tls`会话的必要条件

在此之后`SMTP`实例就能携带`ssl`上下文， 然后调用`starttls`方法初始化加密信道，再度验证`tls`下的`ehlo`, 这样就走完了一道完整的`email`加密程序

邮箱现在都改为授权码来登陆`smtp`服务器来
```python
import sys, smtplib, socket

message_template = """To: {}
From: {}

Hello from wcw!
"""

def main():
    server, fromaddr, toaddrs = 'smtp.qq.com', '344078971@qq.com', ['344078971@qq.com']
    message = message_template.format(', '.join(toaddrs), fromaddr)

    username = '344078971'
    password = 'authorization code'

    try:
        connection = smtplib.SMTP_SSL(server, 465)
        try:
            connection.login(username, password)
        except smtplib.SMTPException as e:
            print("Authentication failed:", e)
            sys.exit(1)
        connection.sendmail(fromaddr, toaddrs, message)
    except (socket.gaierror, socket.error, socket.herror,
            smtplib.SMTPException) as e:
        print("Your message may not have been sent!")
        print(e)
        sys.exit(1)
    else:
        print("successful")
        connection.quit()

if __name__ == '__main__':
    main()
```

### 13.7 `smtp`认证
`smtp`认证要求发件方的账户信息， 无认证信息就能发送邮件的话， 推送垃圾邮件的门槛就会提高，进一步泛滥

代码部分在建立`ssl`上下文后增加一步， 调用`SMTP`实例的`login`方法提交用户名密码即可

### 13.8 tips
-    `smtp`不能完全确保消息的正确传输
-    `SMTP`实例的`sendmail`会在任一接受失败时抛出异常
-    `ssl/tls`需证书验证
-    `smtplib`模块的作用是将`email`提交到临近的`smtp`服务器

---
## 14 POP3
`smtp`的`email`协议的上行部分， `pop3`与`imap`均为下行

`pop3`的功能是对服务器的`email`进行下载与删除，类似`get`、`delete`， 要进一步同步`email`状态就需要功能更强大的`imap`协议了

`pop`服务器对协议实现不太符合不标准

### 14.2 连接与认证
`pop`认证有用户/密码、`apop`两种，

`pop`的`ssl`会话， 调用`poplib`模块`POP3_SSL`实例的`user`、`pass_`方法来提交身份认证
有的`pop`服务器会根据连接修改`email`的状态标记

`apop`协议利用挑战-响应机制来避免明文密码，由于并不是真正意义的数据加密, 底层传输的数据包被捕获后仍会被观测到，代码上区别就是换成`apop`方法提交用户密码

认证失败时会抛出`error_proto`异常

认证后调用`POP3_SSL`实例的`stat`方法可以获取`email`总的统计信息, `list`方法返回逐条信息的编号、字节大小

### 14.4 下载与删除
`list`方法调用时给服务器发送`LIST`命令至`pop`服务器， 返回响应体、信息摘要、响应体大小

根据`listing`摘要信息编号，调用`retr`、`top`、`dele`方法直接对`email`进行操作
-    `top`方法对`email`进行预览操作，不影响`email`状态
-    `retr`方法抓取`email`
-    `dele`方法进行删除操作， 调用前需考虑清楚是否需要备份

`pop`会话需尽量简短， 会话结束需调用`quit`方法来退出邮箱， 否则邮箱可能会锁死

---
## 15 IMAP
`imap`具备所有的`pop`功能外， 提供了更多的`email`功能
-    永久分类归档
-    状态标记
-    文本搜索
-    消息上传
-    可靠消息同步， 维护唯一的持久化消息编号
-    文件夹共享
-    选择性下载

### 15.1 使用`imap`
`imaplib`的客户端接口仅提供非常基础的功能，需要手动处理请求与响应，
`IMAP4_SSL`实例成功认证后，`capabilities`属性可用来查看当前`imap`服务器所支持的特性有哪些
`list`方法返回的文本串需要手动解析

`IMAPClient`基于`imaplib`，该实例的`list_folders`方法提供了解析功能， 并以`python`元组返回文件夹标记、分隔符、名称

标准文件夹标记, 
-   `\Noinferiors`， 子文件夹， 不支持再度创建子节点
-   `\Noselect`， 只能包含子文件夹， 不支持消息结点
-   `\Marked`，  即使标记过，文件夹下后续还是可能有新消息进来
-   `\Unmarked`， 无新消息

`imap`协议是带状态的， 这就要求消息操作依赖于文件夹对象， 选择文件夹对象时指定只读属性对读操作上锁能优化磁盘性能

#### 消息号与`UID`
消息号与`UID`是`imap`引用特定消息的方法，
消息号在连接建立时顺序分配，随会话结束而收回
`UID`与会话独立，对文件夹的在编辑不会改变`UID`，需设置`UIDVALIDITY`属性对`UID`进行校验

#### 消息范围
消息的`imap`命令是可以进行批处理的， 消息号参数的指定支持消息列表格式， 支持通配符

#### 摘要信息
`IMAPClient`实例调用`select_folder`方法返回的摘要为字典形式， 内容包括文件夹的统计、标记、自定义、`UID`、未读等相关信息， 
其中`UIDVALIDITY`字段的字符串用于对客户端的消息`UID`进行比对校验， 并更新

#### 下载整个邮箱
`IMAPClient`的`fetch`方法用于在选择文件夹后，抓取文件夹指定消息号的全部内容， 指定`1:*`抓取文件夹，对应整个邮箱， 
消息命令`BODY[]`请求整个消息体， `PEEK`方法指定查询操作，不对消息进行标记已读，配合`email`模块解析指定字段， 自定义打印摘要信息

#### 单独下载消息
在`imap`命令`[]`内传入字段、协议规范、标记等，可以在整个消息体的基础上进行`query`各个部分的消息体

以`mime`为例， 首先还是调用`list_folders`指定文件夹，然后`fetch`方法传入消息命令，指定消息体部件，返回这些部件的消息摘要字典，
再度调用`fetch`， 根据摘要信息选取指定消息(传入摘要中的`UID`、消息号)， 这时可以通过`imap`命令`BODYSTRUCTURE`以递归的形式只返回消息的`mime`

消息切片可以通过`BODY[]<start, end>`命令，返回区间内的`bytes`

#### 消息标记
消息最常用的标准标记
-    `\Answered` 消息已经回复过
-    `\Draft`  草稿
-    `\Flagged` 标记， 有特殊意义
-    `\Recent` 最近消息， 该标记无法用常规手动删除， 在选择邮箱后自动被删除
-    `\Seen` 已读

`IMAPClient`的`fetch`方法传入`FLAGS`命令可以抓取消息标记 ， 然后调用`get_flags`、`set_flags`、`add_flags`、`remove_flags`即可对标记进行编辑

#### 删除消息
消息的删除可以通过消息标记， 将要删除的消息标记设置为`\Delete`，
`IMAPClient`可以调用`delete_message`方法，传入`UID`列表，将列表类的消息都标记为`\Delete`，
然后调用`expunge`方法， 完成消息的实际删除，删除后还会对现存的消息进行再排序

#### 搜索
对`search`方法， 传入搜索命令字符串， 返回所有满足搜索命令的消息`UID`

#### 操作文件夹与消息
`imap`对文件夹的增删操作需要进行错误检查

`imap`内部添加消息可以通过复制和添加，复制并无任何风险，添加新消息需要考虑行分隔符
`imap`的行尾结束标志也是`CR-LF`, `python`字符串方法`splitlines`可以识别`\r \n \r\n`三种行尾标志

---
## 16 `Telnet`与`SSH`
### 16.1 命令行自动化
`python`远程命令行自动化工具
-   `Ansible`, 可用于管理大量远程机器的配置
-   `Saltstack`， 可在每台客户端上安装自己的代理，主机器推送消息至其余机器要更快

在终端输入命令时，遇到具有特殊意义的字符需要转义，
`shell`可以运行子进程， 子进程的输出可以通过管道重定向作为新命令的输入

纯底层的`unix`命令行没有任何特殊字符或保留字符， 受特殊字符影响的是`shell`的语法解析器
换成操作系统级的子进程调用来执行终端命令是不会受特殊字符的影响的， 
`python`中开启子进程通过`subprocess`模块， `call`方法可以调用环境变量以及当前目录下的可执行程序
最常见的就是空格分隔符了， 文件名带有空格， 但在`shell`下文件却被当做两个

网络命令行会话通常还是通过`shell`协议， 直接与`shell`进行交互， 调用`shell`命令通过`os.system`
`pipes`模块用来构造复杂的`shell`命令,  对每个参数调用`quote`方法，再进行空格拼接

`windows`命令行则是直接将所有文本直接传给了新开启的子进程， 然后再有进程来完成对字符串的解析
对此`subprocess`模块给`windows`命令行下提供了`list2cmdline`方法将类`unix`风格的命令解析为`windows`风格

#### 终端
终端是回显输入，打印输出的一类设备， 终端作为输入方被视作人类用户， 与其连接的`shell`会将输出编码为可读形式

当输入不是从终端传给`shell`时， `shell`并不会打印其输出，
执行`cat | bash`，可以看到命令提示符的消失， `Ctrl`+`D`给`cat`命令发生结尾标志
`sys.stdin.isatty`方法判断当前输入是否为终端
`ps`、`ls`命令在终端输入下会自动调整输出格式

#### 终端的缓冲行为
当与程序交互的是文件、管道， 可读性反而成了性能累赘， 输出会被缓存，进而批量传递
在编写自动化代码涉及到终端与文本、管道输入切换时， 程序行为会发生变化，被挂起、输出被放入缓冲区，打印有延迟

目前标准的字符输入以行为基准， 字符可在行内增删，回车为结尾标志，
`unix`针对大批量输出有暂停/继续( `Ctrl` + `S`/`Ctrl` + `Q`)功能，`vim`也有同样的设计

可通过`stty`命令对`icanon`、`ixon`设置进行修改以启/停上述功能

### 16.2 `Telnet`
`telnet`会建立一个信道，然后明文传输数据包， 不存在安全性的考量， 目前应用主要在小型嵌入式系统、内网通信、测试等

`telnet`会话的建立需要调用`Telnet`实例的`read_util`方法读取服务端的认证提示信息，再调用`expect`方法确认认证成功的通知信息，`interact`方法允许用户直接在终端上通信

`telnet`对控制信息的嵌入格式有规定，对数据于控制码进行区分，必要时需协商`option`， `telnetlib`默认拒绝一切选项
对选项设置可以给`set_option_negotiation_callback`方法传一个回调函数

### 16.3 `SSH`
`python`的`paramiko`库对`SSH`提供了很好的支持

`SSH`协议已经实现了多路复用，通过对信道的每个消息块添加信道标识符，多个信道可以共享同一个`ssh socket`，
能在同一连接内执行单独执行不同语义任务

`ssh`会话建立最耗时的部分在密钥的协商与认证上， 主机密钥默认在`~/.ssh/knows_hosts`文件中，
当密钥不存在时，建立会话都会出现提示信息，然后初始化`host`文件， 可以将公钥上传至服务器的`ssh`配置中实现免密登录

`paramiko`在实现`ssh`功能前需保证主机密钥已在配置文件中，否则需手动处理(继承`MissingHostKeyPolicy`)密钥缺失、无法识别的情况

 `ssh`的认证可以通过`paramiko`下`SSHClient`实例的`connect`方法，传入用户密码建立会话， 上传公钥后参数可以只传域名，
 
 #### `shell`会话与独立命令
 如果不编写交互式程序， 应该避免使用`invoke_shell`方法， 该方法不会等待远端`shell`的初始化就将消息推送， 以及命令的解析成本高
 
 `exec_command`方法无需启动完整的`shell`会话即可传递命令， 相当是抽象成了`subprocess`模块， 
 
 `invoke_shell`、`exec_command`均会隐式的建立一条信道以保证并行的稳定， 不同会话不串扰
 
 #### `sftp` 通过`ssh`传输文件
`sftp`具有状态，支持绝对路径与相对路径， 也可以调用`getcwd`、`chdir`方法进行路径切换
`sftp`可以通过`file`、`open`方法获取信道下的文件对象
`sftp`对文件名的解析不支持`shell`的语法

调用`SSHClient`实例的`open_sftp`即可创建一个`sftp`对象， `get`、`put`方法是对`open`方法的轻度封装，阻塞式传输

对于一些简单文件传输通过`scp`命令即可实现同样的功能， 用`python`编写`sftp`代码可实现更复杂的功能

要实现`X11会话`以及`端口转发`， 需要更底层一点的接口， 需要直接与客户端的`transport`对象交互，
`SSHClient`调用`get_transport`方法返回`transport`对象

---
## 17 `FTP`
`ftp`的主要用途
-    文件下载、匿名上传
-    文件同步
-    全功能文件管理

`ftp`为长连接，且不具备安全性，文件下载上传几乎已被`http`替代， 文件同步`rsync`、`rdist`能端对端更高效的实现

完整的文件系统访问`ftp`目前还尚未被替代， 当然也不是直接使用，而是解决安全性问题的`sftp`

`ftp`默认使用两个`tcp`连接
-    控制信道，传输命令、结果确认
-    数据信道

### `ftp`会话
认证后， 需要客户端指定操作： 下载指定文件/目录，上传则通过修改目录
然后服务端再开启数据信道传递数据
可以在一个`ftp`会话中访问多个不同目录

### 文件下载/上传
数据传输的编码通常为文本或二进制,`ftplib`集成相关的方法,可以指定远程执行的命令,以及相关行为的回调
-    文本按行传输，需手动添加行尾结束标识，对应`FTP`实例的`retrlines`方法
-    二进制按块传输, 块大小基于传输层协议，对应`FTP`实例的`retrbinary`方法

与下载相对的方法为`storlines`、`storbinary`， 区别在于第二个参数， 由远端返回数据以写操作的回调函数变成了本地读操作的文件句柄

对底层的实现， 选择目录后，调用错误检验的`voidcmd`方法， `ntransfercmd`方法获取`tcp`连接的`socket`及数据量的估算值

`ftplib`的`all_errors`属性继承了所有的`ftp`异常用以捕获

### 扫描目录
获取目录信息
-    `nlst`函数,  目录内容的信息， 仅字符
-    `dir`函数， 目录内容信息及属性， 接受参数可以为对象的`append`方法

配合`nlst`函数即可实现对目录下的文件递归下载

`ftplib`模块同时还支持对远端目录的增删改操作， 故可基于`ftp`编写图形化远程文件系统应用

---
## 18 `RPC`
`rpc`需协商好序列化方式，使用上通常伴随着
-    任务量大，被分发至不同机器
-    任务依赖于远端数据信息

`json`、`xml`具备自描述性，字节解析较为容易，不足在于其自描述性依赖于数据冗余， 会造成性能损耗

`rpc`较`http`、`smtp`协议更抽象， 约束更少，从表现上，可抽象为普通函数

### 18.1 `rpc`特性
-    `rpc`限制数据类型，单语言支持的`rpc`提供更多的数据类型，操作系统外的资源均可通过网络字节
-    客户端可抛出异常
-    需提供寻址方法， 简单的实现可以用`ip`、端口、`url`
自省功能静态语言通常会提供

编写`rpc`代码需要注意
-    避免语言层面的`bug`
-    单返回值
-    类型转换， 将`rpc`不支持数据类型转换为支持类型

#### `xmlrpc`
`xml`只能包含结点、字符串、字符串属性，`python`对`xml`提供原生支持，
`xmlrpc`模块通过注册回调函数即可实现简单的`xml-rpc`服务
可以注册配置函数实现自省等额外功能

对具有自省功能的服务， 客户端可以调用`listMethods`方法获取`rpc`函数签名

`xmlrpc`不支持关键字参数， 传递的字典数据时要求其键的值为字符串

#### `jsonrpc`
`jsonrpc`针对数据，比`xml`的数据冗余要小得多, 原生支持`bool`数据类型
用`jsonrpclib`三方库实现`jsonrpc`服务于`xml`类似

#### 自文档数据
`xmlrpc`针对静态语言数据类型为`struct`, 与`jsonrpc`的`object`的主要区别在于非字符串键值
在`python`中，兼容两种类型的解决方案是用字典列表替代， 进而的衍生产品`具名数组`具有更高的性能

#### `python`原生`rpc`系统
基于`python`序列化模块`pickle`的`Pyro`、`RPyC`

`rpyc`仅序列化`immutable`对象， 对`mutable`对象将会传递其标识符，适合用来协调不同网络位置的`python`对象

<!-- 2020年7月28日 22:31  -->