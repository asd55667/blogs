<!--
updated: 2020年6月22日 00:25
tags: [lfu, cache, algorithm, data structures, python, interview]
-->

# lfu(Least Frequently Used)缓存

> 准备秋招时刷题的笔记, 觉得比较重要单开的一篇

页面置换算法淘汰优先级最低的页,可以将其转换为一个排序任务,将优先级最低的排到队列的出口
对lru算法， 固定了队列入口，链表结构具有了一定的时序性
lfu与lru相比起来多了个频率优先级， 原理还是差别不怎么大， 实现方式也是有多种，
最容易想到的方法就是增加一个独立的频率维度，然后在固定维度下比较时间先后

```python
class Node:
    def __init__(self, freq, time, val):
        self.freq = freq
        self.time = time
        self.val = val

    def __gt__(self, y):
        return self.time > y.time if self.freq == y.freq else self.freq > y.freq

    def __lt__(self, y):
        return not self.__gt__(y)

import collections

class LFUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.n = 0
        self.time = 0
        self.elems = collections.OrderedDict()

    def get(self, key: int) -> int:
        # update timestamp
        self.time += 1
        # found key and bufsize > 0
        if key in self.elems.keys() and self.cap:
            self.elems[key].freq += 1
            self.elems[key].time = self.time 
            self.sort()
            return self.elems[key].val
        return -1  

    def put(self, key: int, value: int) -> None:
        self.time += 1
        if key in self.elems.keys():
            self.elems[key].freq += 1
            self.elems[key].time = self.time
            self.elems[key].val = value
        else:
            # full bufsize OrderedDict not empty
            if self.n == self.cap and self.elems:
                self.elems.popitem(0)
                self.n -= 1
            self.elems[key] = Node(1, self.time, value)
            self.n += 1 
        self.sort()

    def sort(self):
        self.elems = collections.OrderedDict(sorted(self.elems.items(), key=lambda x: x[1]))
```
