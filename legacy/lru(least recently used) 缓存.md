<!--
updated: 2020年5月28日 23:46
tags: [leetcode, algorithms, data structures, lru cache, c, python]
-->

# lru(least recently used) 缓存

> 准备秋招时刷题的笔记, 很多面经都重点提过 练习了 C 和 python 的版本, 还为此做了ppt动画

最近也是刷leetcode碰到了，第一次接触lru的概念还是在去年读流畅的pyhton的时候,
当时主要是了解了lru基本原理及其使用方法，今天来做些更细致的了解

[comment]: <> (basic priceple)
## 原理回顾
从正式接触代码快两年了吧，自己也不是理解能力很强的那种，感觉学编程还是得从具体的行为去理解稍微要容易些些吧

给定缓存窗口为3， 和`[1, 2, 3, 4, 1, 3, 1, 1,  ? ]`这么一串序列， 从右侧进入


数字指的键值， 黄色椭圆代表计算
没想到用ppt做个动画这么麻烦，下回还是想办法能不能找个图形库实现下，手动搞这个还是有点吃亏

有代表性的相关应用的话，有redis和memcache，[python](https://github.com/python/cpython/blob/master/Lib/functools.py)的STL跟[安卓](https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/util/LruCache.java)的基础组件中也有具体的实现

[comment]: <> (code implementation)
## 代码实现
用代码来实现一个功能要尽可能的去模仿其行为，该功能具有那些特征，要理清其逻辑顺序，再结合语言特性
lru的常规实现方法是哈希表和双向链表,  使用哈希表能在O(1)时间下找到键值，双向链表能在O(1)时间增删结点，并保持有序
关于这两个数据结构的组合

<center><img src="https://www.interviewcake.com/images/svgs/lru_cache__doubly_linked_list.svg" width = "50%" height = "50%" /></center><center>[图1](https://www.interviewcake.com/concept/java/lru-cache):点餐系统</center>


<center><img src="https://miro.medium.com/max/1300/0*fOwBd3z0XtHh7WN1.png" width = "70%" height = "70%" /></center><center>[图2](https://medium.com/@krishankantsinghal/my-first-blog-on-medium-583159139237)</center>




这里参考[geeksforgeeks](https://www.geeksforgeeks.org/lru-cache-implementation/)的实现，只有键值的lru序列。
文章里描述说的是双端队列， 一直搞不明白跟双向链表有啥区别， 从功能上看以为差不多的东西，
特意查了下[Quora](https://www.quora.com/What-is-the-difference-between-a-deque-and-a-doubly-linked-list#), 目前就先认同这个观点吧。 双端队列是抽象数据结构， 可以用双向链表或是数组实现。

```cpp
#include <stdio.h>

#include <iostream>
#include <unordered_map>
#include <list>

class LruSequence{
private:
    // double linked list
    std::list<int> dq;
    // hash map
    std::unordered_map<int , std::list<int>::iterator> um;
    size_t max_len;
    
public:
    LruSequence(int n): max_len(n){};
    
    void enque(int key);
    void display();
};

void LruSequence::enque(int key){
    auto it = um.find(key);
    // not in cache
    if(it == um.end()){
        // length of double linked list reaches the end of bufsize
        if(dq.size() == max_len){
            // remove the least recently used element out of deque
            int last = dq.back();
            dq.pop_back();
            um.erase(last);
        }
    }
    else{
        // erase the old node
        dq.erase(um[key]);
    }
    // set most recentlt used element to the head of deque
    dq.push_front(key);
    // update the mapping of double linked list and hash map
    um[key] = dq.begin();
}

void LruSequence::display(){
    size_t n = dq.size();
    size_t nspace = max_len - n;
    
    std::cout << '\t';
    while(nspace--)
        std::cout << ' ';
    
    for(auto it : dq){
        std::cout << it;
    }
    std::cout << '\n';
}

#define N 8
#define BUF_SIZE 3

int main(int argc, char **argv){
    LruSequence lruSeq = LruSequence(BUF_SIZE);
    int seq[N] = {1, 2, 3, 4, 1, 3, 1, 1};
    for(int i = 0; i < N; i++){
        lruSeq.enque(seq[i]);
        lruSeq.display();
    }
    std::getchar();
    return 0;
}

```
<details>
<summary>输出</summary>
	
```
		1
	 21
	321
	432
	143
	314
	134
	134
```
</details>

在应用中，往往是以key：value的形式。以fibonacci数列为例，python中functools的实现把ke函数签名(当参数比较多时为函数签名的hash值)当作key值，value则为计算结果。

[leetcode146题的参考答案](https://leetcode-cn.com/problems/lru-cache/solution/lru-huan-cun-ji-zhi-by-leetcode/)中的解法二为常规做法，
解法一中python的OrderedDict与java的LinkedHashMap这两数据结构则是自身实现了deque中元素的置顶置底操作。

按照leetcode的思路，以键值对的形式用c实现了下对应的双向链表，分别设置一个为空的头节点和尾节点，一个简单的哈希函数，

```c
#include <stdio.h>
#include <stdlib.h> // malloc free
#include <string.h> // memset

typedef struct Node{
    char *key;
    int val;
    struct Node *prev;
    struct Node *next;
} LinkedListNode;

typedef struct HashList{
    struct HashList *next;
    char *key;
    LinkedListNode *node;
}Hash;

typedef struct {
    size_t size;
    size_t max_len;
    LinkedListNode *head;
    LinkedListNode *tail;
    Hash **hash;
}Deque;



size_t simple_hash(char *s);
LinkedListNode *find(Hash **hash, char *key, size_t idx);
void delete_hash_key(Hash **hash, size_t idx, char *key);
void add_hash_key(Hash **hash, size_t idx, char *key, LinkedListNode *node);

Deque *que_init(size_t max_len);
void enque(Deque *dq, char *key, int val);
char *pop_back(Deque *dq);
void display(Deque *dq);


void free_list(LinkedListNode *node);
void free_hash(Hash **hash);
void free_que(Deque *dq);


#define N 8
#define BUF_SIZE 3
#define HASH_SIZE 4
int main(int argc, char **argv){
    char *key_seq[N] = {"wcwa", "wcwb", "wcwc", "wcwd", "wcwa", "wcwc", "wcwa", "wcwa"};
    int val_seq[N] = {1, 2, 3, 4, 1, 3, 1, 1};
    Deque *dq = que_init(BUF_SIZE);
    for(int i = 0; i < N; i++){
        enque(dq, key_seq[i], val_seq[i]);
        display(dq);
    }
    
    free_que(dq);
    return 0;
}

// hash
size_t simple_hash(char *s){
    size_t hash_val;
    for(hash_val = 0; *s != '\0'; s++){
        hash_val = *s + 31 * hash_val;
    }
    return hash_val % HASH_SIZE;
}

LinkedListNode *find(Hash **hash, char *key, size_t idx){
    Hash *hash_node;
    for(hash_node = hash[idx]; hash_node != NULL; hash_node = hash_node->next){
        if(hash_node->key && strcmp(hash_node->key, key) == 0)
            return hash_node->node;
    }
    return NULL;
}

void delete_hash_key(Hash **hash, size_t idx, char *key){
    Hash *hash_node;
    for(hash_node = hash[idx]; hash_node->next != NULL; hash_node = hash_node->next){
        if(hash_node->next && strcmp(hash_node->next->key, key) == 0){
            Hash *tmp = hash_node->next;
            hash_node->next = hash_node->next->next;
            free(tmp);
            return;
        }
    }
}

void add_hash_key(Hash **hash, size_t idx, char *key, LinkedListNode *node){
    Hash *hash_node = hash[idx];
    while(hash_node->next)
        hash_node = hash_node->next;
    
    Hash *tail;
    tail = malloc(sizeof *tail);
    tail->next = NULL;
    tail->key = key;
    tail->node = node;
    hash_node->next = tail;
}



// deque
Deque *que_init(size_t max_len){
    Deque *dq;
    dq = malloc(sizeof *dq);
    memset(dq, 0, sizeof *dq);
    dq->max_len = max_len;
    
    dq->head = malloc(sizeof *dq->head);
    dq->tail = malloc(sizeof *dq->tail);
    dq->head->next = dq->tail;
    dq->tail->prev = dq->head;
    
    Hash **hash_table;
    hash_table = (Hash **)malloc((HASH_SIZE * sizeof *hash_table));
    for(size_t i = 0; i < HASH_SIZE; i++){
        hash_table[i] = malloc(sizeof **hash_table);
    }
    dq->hash = hash_table;
    return dq;
}



char *pop_back(Deque *dq){
    LinkedListNode *last_node = dq->tail->prev;
    char *last = last_node->key;
    dq->tail->prev = last_node->prev;
    last_node->prev->next = dq->tail;
    free(last_node);
    return last;
}

void enque(Deque *dq, char *key, int val){
    size_t idx = simple_hash(key);
    LinkedListNode *node = find(dq->hash, key, idx);
    if(!node){
        if(dq->size == dq->max_len){
            char *last = pop_back(dq);
            // delete hash
            delete_hash_key(dq->hash, simple_hash(last), last);
        }
        else{
            dq->size++;
        }
    }
    else{
        // remove existing node
        // when the existing node is exactly the first node
        if(dq->head->next->key != node->key){
        node->prev->next = node->next;
        node->next->prev = node->prev;
        free(node);
        }
        else return;
    }
    LinkedListNode *newhead;
    newhead = malloc(sizeof *newhead);
    memset(newhead, 0, sizeof *newhead);
        
    newhead->key = key;
    newhead->val = val;
        
    newhead->next = dq->head->next;
    dq->head->next->prev = newhead;
    dq->head->next = newhead;
    newhead->prev = dq->head;
    add_hash_key(dq->hash, idx, key, newhead);
}

void display(Deque *dq){
    printf("\t");
    
    LinkedListNode *cur = dq->head;
    while(cur->next->key){
        printf("%s: %d ", cur->next->key, cur->next->val);
        cur = cur->next;
    }
    printf("\n");
}


void free_list(LinkedListNode *node){
    LinkedListNode *next;
    while(node){
        next = node->next;
        free(node);
        node = next;
    }
}

void free_hash(Hash **hash){
    for(size_t i = 0; i < HASH_SIZE; i++){
        Hash *next;
        Hash *hash_node = hash[i];
        while(hash_node){
            next = hash_node->next;
            free(hash_node);
            hash_node = next;
        }
    }
    free(hash);
}

void free_que(Deque *dq){
    free_list(dq->head);
    
    free_hash(dq->hash);
    
    free(dq);
}

```

<details>
<summary>Output</summary>
```
wcwa: 1 
wcwb: 2 wcwa: 1 
wcwc: 3 wcwb: 2 wcwa: 1 
wcwd: 4 wcwc: 3 wcwb: 2 
wcwa: 1 wcwd: 4 wcwc: 3 
wcwc: 3 wcwa: 1 wcwd: 4 
wcwa: 1 wcwc: 3 wcwd: 4 
wcwa: 1 wcwc: 3 wcwd: 4 
```
</details>





![](https://wuchengwei.icu/wp-content/uploads/2020/05/lru_hash_douleLinkedList-300x225.jpg)
fibonacci的实现留到下次写装饰器的时候再码字吧





[node](https://github.com/isaacs/node-lru-cache)


[visual memory](https://www.wiley.com/college/silberschatz6e/0471417432/slides/pdf2/mod10.2.pdf)
