<!--
updated: 2020年7月6日 23:54
tags: [leetcode, algorithms, data structures, sorting, interview]
-->

# leetcode

> 准备秋招时刷题的笔记

# 排序
|方法|容器|时间复杂度|空间复杂度|
| ------- | ------- | ------- | ------- |
| 插入排序  |数组   | O(n^2) |  O(1) |
|   |链表    | O(n^2）| O(1)
| 堆排序|数组   | O(nlogn)   | O(1)  
|   |链表    | O(nlogn)  | O(n)  |
|   |链表    | O(n^2logn)   | O(1)  |
| 快排  |数组 | O(nlogn)~O(n^2)   | O(logn)~O(n)  |
|   |链表    | O(nlogn)~O(n^2)   | O(logn)~O(n)  |
| 归并(top down)  |数组   | O(nlogn)   |O(n + logn)   |
|   |链表    | O(nlogn)  |O(logn)   |
| 归并(down top)  |数组  | O(nlogn)   |O(n)   |
|   |链表 | O(nlogn) |O(1)  |

### 148  Sort List
##### O(1)空间复杂度，O(nlogn)时间复杂度链表排序解法
长度为1开始，与临近节点配对、拆分、归并，每迭代一次归并的长度翻番
##### O(logn)空间复杂度，O(nlogn)时间复杂度链表排序解法
对半拆分链表， 递归归并




## RMQ RSQ
## [Fenwich Tree(Binary Indexed Tree)](https://visualgo.net/zh/fenwicktree)
优点： 能高效的更新、对数表区间进行聚合操作
##### update tree
树高为logn，父节点以索引与其二进制最低bit位的和建立, `i+=lowbit(i)`,节点值的更新通过父节点层层向上传递
##### query tree
查询自底向上，以索引与其最低bit位的差进行迭代，`i-=lowbit(i)`
最低bit位可以通过与自身的补码进行与操作获得`i & (-i)` 
```cpp
class FenwickTree{
private:
    static inline int lowbit(int i) {return i & (-i);}
    vector<int> _nums;
    vector<int> sum;
public:
  FenwickTree(vector<int> &nums): _nums(nums), sum(n+1, 0)
  {
      for(int i = 0; i < _nums.size(); i++){
        update(i+1, _nums[i]);
      }  
  }
  
  void update(int i, int diff){
    while(i < _nums.size()){
      sum[i] += diff;
      i += lowbit(i);
    }
  }
  
  int query(int i){
    int ret = 0;
    while(i > 0){
      ret += sum[i];
      i -= lowbit(i);
    }
    return ret;
  }
  
  void set(int i, int val){
    update(i+1, val - _nums[i]);
    _nums[i] = val;
  }
  int sumRange(int i, int j){
    return query(j + 1) - query(i);
  }
  
}
```
在调用`FenwickTree`实例时须注意数表的索引是以`1`起始的， `0`是没有为`1`的`bit`的

## Segment Tree
```python
class Node:
    def __init__(self, start, end, val, left, right):
        self.start, self.end = start, end
        self.mid = start + (end - start) // 2
        self.val = val
        self.left, self.right = left, right

class SegmentTree:
    def __init__(self, nums):
        self.nums = nums
        if self.nums:
            self.root = self.build(0, len(nums) - 1)

    def build(self, start, end):
        if start == end: return Node(start, end, self.nums[start])
        mid = start + (end - start) // 2
        left = self.build(start, mid)
        right = self.build(mid+1, right)
        return Node(start, end, left.val + right.val, left, right)

    def update(self, root, i, val):
        if root.start == i and root.end == i:
            root.val = val
            return
        if i <= root.mid:
            self.update(root.left, i, val)
        else:
            self.update(root.right, i, val)
        self.val = self.left.val + self.right.val
        
    def sum_range(self, root, i, j):
        if root.start == i and root.end == j:
            return root.val
        if j <= root.mid:
            return self.sum_range(left, i, j)
        elif i > root.mid:
            return self.sum_range(right, i, j)
        else:
            return self.sum_range(root.left, i, mid) + self.sum_range(root.right, root.mid+1, j)
    
```
##### 307 range sum query - mutable
##### 315 Count of smaller number after self
##### 1505 最多 K 次交换相邻数位后得到的最小整数



## 子串
滑动窗口， 首尾指针， 关键位置

## 链表
快慢指针

## dfs bfs
### 非递归
栈实现dfs， 队列实现bfs
题型： 树， 图


## 图
邻接矩阵，floyd， DijStla， a*
### 无向图
### 有向图

闭环， 标志位记录访问过的元素
