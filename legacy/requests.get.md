# requests.get

> python网络编程练习过程中遇到的问题 心血来潮对当时python的request库的一番探究

用`c` `socket` 写的跟`python` `requests.get`不一致
即使`header`相同，抓取的`DOM`也有区别， 一个1700行， 一个才200多
`header`字段不一样，光相应头跟部分`meta`,文本都出不来是什么鬼， `user-agent`换成`python-requests`, `body`至少有了点

### requests 2.24.0
`get`调用的是`Session`对象的`request`方法

对一个会话实例，它有以下属性
-    `header`默认字段包括`User-Agent`、`Accept-Encoding`、`Accept`和`Connection`，
-   `hook` 事件句柄钩子默认为一个仅有`response`键的字典,   值默认为`list`
-    `verify`为`True`默认开启`ssl`验证
-    `cookie`为一个`RequestsCookieJar`对象,  实则是`cookielib`模块下`CookieJar`的`dict`接口，将`cookie`参数传入的更新到`cookiejar`中
-    `adapters`为有序字典， 默认会注入`http`、`https`前缀的`HTTPAdapter`对象

再回到`request`方法， `request`方法构造一个`Request`实例，通常的`get`调用只指传递`get`方法名、`url`和默认的`allow_redirects`允许重定向字段到`Request`构造器，

接着`session`调用`prepare_request`方法会将`request`中的`cookie`参数与`session`中的`cookie`整合， 在安全环境下，会话与请求都没显示设置权限时，会尝试用`netrc`模块获取授权,  通常会返回空值`requests.utils.get_netrc_auth('news.sohu.com')`

最后再将`Request`再`wrapper`一层为`PreparedRequest`， 调用其`prepare`方法, 这次会做些更为细腻的操作，将`get`方法转为大写再进行`ascii`编码， 整合会话与请求的参数等， 内部会调用多个处理函数
-    `prepare_method` 兼容`py2.x`
-    `prepare_url` 格式化`url`, 将`http`协议的`url`解析，正则匹配各个字段，矫正、重组
-    `prepare_headers` 首部格式化，键值放入非大小敏感字典中， 核对键值对的有效性
-    `prepare_cookie` 将`cookie`注入首部， 先是构造`MockRequest`， 然后在`CookieJar`的`add_cookie_header`方法里解析`cookie`来完成`mock`
-    `prepare_body` 请求数据检查，文本还是生成器、迭代器、句柄， 流是否分块， 句柄指针结束标识，为表单数据添加相应首部字段`Content-Type`
-    `prepare_auth`  `session`的`auth`属性默认是`None`的， 这里会解析`url`中的`auth`信息， 若`url`中包含`auth`， 以此`auth`构造`HTTPBasicAuth`实例， 并更新到`session`中， 同时更新`body`长度
-    `prepare_hooks` 注册钩子函数前须完成`auth`的相关检查，因为`auth`可以添加钩子，不能漏

`session`默认是无代理的，这样一来， `send`方法就仅发送一个`PreparedRequest`与允许重定向字段，
`send`方法实际是调用的`adapter`的`send`方法,   然后就是`httplib`、`urllib3`等封装的`socket`抽象库实现的会话，收发消息

```python
import socket, ssl
def cwl(url):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    sock.connect((url, 443))

    sock = ssl.wrap_socket(sock)

    req = '''\
GET / HTTP/1.1\r\n\
Host: news.sohu.com\r\n\
User-Agent: python-requests/2.24.0\r\n\
Content-Language: zh-CN\r\n\
Connection: Close\r\n\
\r\n\
'''
    sock.sendall(req.encode('ascii'))

    f = open('d.html', 'w', encoding='utf8')
    raw = b''
    while 1:
        more = sock.recv(1<<12)
        # import ipdb; ipdb.set_trace()
        f.write(more.decode())
        if not more: break
        raw += more
  
    sock.close()
    f.close()
```
今天尝试用`python`的`socket`抓搜狐首页， 将问题又重新定位了下，一开始用 `python`的`plain` `http`请求直接返回的`400`， 还以为会跟`c`一样`443`端口连接建立后自动协商， 老实套上`ssl`后发现一样是`200`多行的响应， 而且位置也差不多， `ipdb`调下发现常用的编码怎么都过不了， 感觉问题跟响应的解析可能也有关系，头大

sb了， 不用`ssl`加密连`443`端口连接都建立不起来

---
```python
import socket, ssl

def cwl(host, port):
    req = f'''\
GET / HTTP/1.1\r\n\
Host: {host}\r\n\
User-Agent: wcw-demo\r\n\
Connection: Close\r\n\
\r\n\
'''

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((host, port))
    sock = ssl.wrap_socket(sock)
    
    sock.sendall(req.encode('utf8'))

    res = b''
    f = open('a.htm', 'w',  encoding='utf8')
    while 1:
        try:
            more = sock.recv(128)
            if not more: break
            # f.write(more.decode('utf8'))
            res += more 
        except Exception as e:
            f.close()
            print(e)

    f.write(str(res, 'utf-8', errors='replace'))
    f.close()
```    
做事前还是得多想想， 误以为会逐行解析响应， 看到`urllib3`的连接池去了
最后总算定位到问题，  全部的二进制响应接受后， 在`model.py`中一处整体进行解析
`content = str(self.content, encoding, errors='replace')`
`python`的`str`类构造函数有提供编码错误的应对机制
具体细节得去看`python`解释器的`C`库了

---
`python`的解码函数`decode`对指定编码外的错误编码字节， 通常会直接抛出`UnicodeError`异常，
指定`errors`参数采取不同的应对处理策略
-    `replace`, 使用`U+FFFD`来替换错误编码字节
-    `ignore`, 去掉该字符
-    `blackslashreplace`,  为字符添加转义符`\`

我现在的看法是， 响应经过层层传递， 以及`unicode`的多子节字符， 很可能在数据包传递的过程中发生错误， 一个`bit`位变化就会有字节受影响， 纠错校验通常也是基于计数， 仍可能漏掉异常，针对现在的问题，需要的是一个对异常`utf8`编码处理的函数,  

还是有问题😂

---
唉， C爬下来都错误编码不影响解码， 响应序列长度不对主要在于， `while`循环`recv`的退出条件， 不像`python`中每次就是`recv`指定的响应长度， 小于其长度时就退出了， 还是得接受子序列长度为0才退出循环， 然后就是`realloc`调整动态内存长度的条件， 感觉明明很难刚好到指定的窗口， 先前的`>=`一直报错`realloc error`, 当然更简单的方法是直接在初次`malloc`时将`bufsize`设到最大

---
完结， `python`的不完整响应在于解码错误，解决方案是`errors`参数的设置， `ignore`或是`replace`,
`c`中的问题在于之前`while`读操作的退出条件不准， `buffer`设置太小`realloc`再分配放大的使用不当造成， 实在太大可以采用指针数组， 分批次存储响应报文

<!-- 2020年7月28日 22:30 -->