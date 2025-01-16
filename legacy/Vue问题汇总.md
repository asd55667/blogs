# Vue问题汇总

> 初次学习Vue2时记录的一些笔记

## 组件注册
```Vue
Vue.component("component-name",{
    props:{
        // data
    },
    template:{
        // reuse code
    },
    data:{
        
    },
    methods:{
        // handleEvent
    }
    
})
```
## 事件
`<tag @event="handleEvent">`
 自定义组件须要手动抛出事件
`this.$emit("method", this.var)`

## 插槽
Qt中也有信号插槽的概念，有种泛型的感觉，增加灵活性。可自行配置

## vue-cli 安装
`npm install -g @vue/cli`
npm ERR! `npm ERR! cb() never called!`
```shell
if [node.version] > 5; then
sudo npm cache verify
else 
sudo npm cache clean
fi
```
npm ERR! `Response timeout while trying to fetch https://registry.npmjs.org/@babel%2fplugin-syntax-optional-chaining (over 30000ms)`
#### 换源
```shell
npm install -g cnpm --registry=https://registry.npm.taobao.org
npm config set registry https://registry.npm.taobao.org
npm config list
```




## 单文件组件更新
更新字段需在`template`中用到
更新字段需在`data`方法中返回
更新多层级字段内部层级需显示声明


## 计算属性 computed
用于替代模板中的计算， 提升性能
依赖于响应式数据

## 监听器 watch
可以执行任何逻辑，如函数节流，Ajax，DOM操作
watch > computed

## 生命周期
创建： 初始化 -> 属性配置 -> 模板编译 -> mounted
更新： 依赖数据改变 -> 监听器操作（不可修改依赖数据）
销毁
```js
new Vue({
  store,    // 初始化 配置
  render: h => h(App),  // 模板编译
}).$mount('#app')     // 挂载
```


## 函数式组件
可看做一个方法， 无状态、无实例、无上下文的三无产品， 一般作展示用， 可在模板中创建零时变量


## 跨组件通信 provide inject
父组件`provide`提供通信属性， 子组件`inject`注入属性
中间父组件`provide`会阶段根组件的`provide`

## 跨层级获取组件实例
主动通知获取， 跨层级组件更新后通过钩子函数将其自身缓存至根组件的`provide`中

## Vuex 状态管理
当状态树比较小时， 可以使用`provide`和`inject`管理状态
状态树较大时就要考虑使用vuex了，
- State   提供响应式数据            ----     this.$store.state.xxx            ----    mapState           取值
- Getter  通过计算属性来缓存    ----     this.$store.getters.xxx         ----    mapGetters        取值
- Mutation 更改state方法           ----     this.$store.commit("xxx")     ----    mapMutations    赋值
- Action   触发mutation方法       ----     this.$store.dispatch("xxx")   ----    mapActions        赋值
- Module 动态添加state到响应式数据

ES2015风格计算属性， 用常量代替mutation事件类型

## Router

<!-- 2020年6月12日 09:03 -->