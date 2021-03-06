# vue-study
learning the source of Vue 
### 前言
Vue.js 是一个非常优秀的前端框架，现在的 Vue 是一个庞然大物，开发版已经有一万多行了，涉及很多复杂的情况和衍生的功能。Vue 的一个最明显的特性就是其不太引人注意的响应式系统，如果想看懂源码必须先理解其原理。数据模型仅仅是普通的 JavaScript 对象。而当你修改它们时，视图会进行更新。我们不禁要提出疑问：这是如何做到的呢？

为了便于理解 Vue 非常重要的响应式系统，我将通过一个简单的案例来告诉你答案，一步一步地实现一个非常简单也是非常经典的案例——双向绑定，希望可以跟着教程自己敲至少一遍代码，具体教程见[/vue-es5/README.md](https://github.com/hamger/vue-study/blob/master/vue-es5/README.md)。

随着代码越来越长，寻找到需要的 js 代码十分不便，使用 ES6 进行模块化开发势在必行。[vue-mine](https://github.com/hamger/vue-study/tree/master/vue-es6/src/vue-mine)是对[step3.html](https://github.com/hamger/vue-study/blob/master/vue-es5/step3.html)的 ES6 实现。

`./vue-es6/src/vue-mine2`是对基础案例的进阶，在基础案例中我们实现了简单的双向绑定功能，但是你可能会想，除了`v-model`之外的其他指令（如`v-text`、`v-html`、`v-class`等）又是如何实现的呢？如果目标元素存在多级子节点怎么办？如何绑定在 Vue 实例中定义好的函数？这些都在[vue-mine2](https://github.com/hamger/vue-study/tree/master/vue-es6/src/vue-mine2)中得到了实现。