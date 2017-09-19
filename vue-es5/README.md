### 前言
如何实现一个双向绑定的简单案例，我将分为三步：

1. model -> view 初始化
2. view -> model 绑定
3. model -> view 绑定

分别对应本目录中的step1.html，step2.html，step3.html。

### step1
第一步我们要考虑的应该是如何把
```html
<div id="app">
    <input type="text" v-model="start">
    <br> {{start}}
</div>
```
中`input`的`value`值和`{{start}}`变为`vm.data.start`的值，即将model转化为view。我们需要一个方法，该方法可以实现以上的转化，让`v-mode="start"`和`{{start}}`绑定到的`data.start`的值，代码如下，具体代码和效果见step1.html。
```js
// 劫持节点并转化为文档片段
function node2Fragment(node, vm) {
    var flag = document.createDocumentFragment()
    var child
    while (child = node.firstChild) { // 编译每个节点，直到node下无子节点
        compile(child, vm)
        flag.appendChild(child) // appendchild方法会自动删除node的child节点（子节点有且仅有一个父节点）
    }
    return flag // 返回填充后的文档片段
}

// 编译节点
function compile(node, vm) {
    var reg = /\{\{(.*)\}\}/
    if (node.nodeType === 1) { // 元素节点
        var attr = node.attributes
        for (var i = 0; i < attr.length; i++) {
            if (attr[i].nodeName == 'v-model') {
                var name = attr[i].nodeValue.trim()
                node.value = vm.data[name]
            }
        }
    };
    if (node.nodeType === 3) { // 文本节点
        if (reg.test(node.nodeValue)) {
            var name = RegExp.$1.trim()
            node.nodeValue = vm.data[name]
        }
    }
}

// 创建Vue对象
function Vue(options) {
    this.data = options.data
    var node = document.getElementById(options.el)
    var dom = node2Fragment(node, this)
    // 将dom片段添加到目标元素
    node.appendChild(dom)
}
```
### step2
第二步需要实现view层向model层的绑定，当用户输入改变input的值(view层)时，反映到data中(model层)并改变对应的值。这里需要用到`Object.defineProperty()`来设置对象的访问器属性。
```js
// 将vm.data上的数据挂载在vm上
function observe(obj, vm) {
    Object.keys(obj).forEach(function(key) {
        defineReactive(vm, key, obj[key])
    })
}

// 创建响应式数据
function defineReactive(obj, key, val) {
    Object.defineProperty(obj, key, {
        get: function() {
            return val
        },
        set: function(newVal) {
            if (newVal === val) return
            val = newVal
            console.log("新属性值为" + val)
        }
    })
}
```
把observe函数在vue构造器中调用
```js
function Vue(options) {
    this.data = options.data
    var node = document.getElementById(options.el)
    observe(this.data,this) // 监听数据
    var dom = node2Fragment(node, this)
    node.appendChild(dom)
}
```
同时我们也需要修改一下原来的`compile`函数,将`vm.data[name]`改为`vm.[name]`
```js
function compile(node, vm) {
    var reg = /\{\{(.*)\}\}/
    if (node.nodeType === 1) {
        var attr = node.attributes
        for (var i = 0; i < attr.length; i++) {
            if (attr[i].nodeName == 'v-model') {
                var name = attr[i].nodeValue.trim()
                node.addEventListener('input', function(e) {
                    vm[name] = e.target.value; 
                });
                node.value = vm[name]
            }
        }
    };
    if (node.nodeType === 3) {
        if (reg.test(node.nodeValue)) {
            var name = RegExp.$1.trim()
            node.nodeValue = vm[name]
        }
    }
}
```
这样当view层被改动时，相应的model层中对应的数据也会改变，具体代码和效果见step2.html。

### step3
现在我们离双向绑定只差最后一步了，也是最重要和最难理解的一步，如何实现当model层中数据改变的时候响应式地改变view层的显示，即当改变`input`输入的时候能马上在下方视图得到显示。第一步做的是初始化绑定，现在要完成的是，当用户改变data值，再回过头去改变view层，这里将用到一个设计模式：观察者模式。
观察者模式是程序设计中的一种设计模式，定义了一种一对多的依赖关系，让多个观察者对象同时监听某一个主题对象。这个主题对象在状态上发生变化时，会通知所有观察者对象，让他们能够自动更新自己。下面代码是一个应用观察者模式的简单例子
```js
// 创建一个主题类
function Dep () {
	this.subs = [] // 主题的订阅者们
} 
// 添加订阅者
Dep.prototype.addSub = function(sub) {
	this.subs.push(sub)
};
// 发布公告
Dep.prototype.notify = function() {
	this.subs.forEach(function(sub) {
		sub.update()
	})
};

// 创建一个订阅者类
function  Watcher(name) {
	this.name = name
}
// 更新自己
Watcher.prototype.update = function() {
	console.log(this.name+'更新了')
};

// 实例化一个主题
var dep = new Dep()

// 实例化订阅者并添加到主题
var sub1 = new Watcher('sub1')
dep.addSub(sub1)
var sub2 = new Watcher('sub2')
dep.addSub(sub2)

// 主题发布公告，订阅者更新自己
dep.notify()
```
接下来我们要将该模式应用在我们的案例中，添加如下代码
```js
// 创建一个主题类
function Dep() {
    this.subs = [] // 主题的订阅者
}

Dep.prototype = {
    // 添加订阅者
    addSub: function(sub) {
        this.subs.push(sub) 
    },
    // 发布更新公告
    notify: function() {
        this.subs.forEach(function(sub) {
            sub.update() // 触发对应属性的 setter
        })
    }
}

// 创建一个订阅者类
function Watcher(vm, node, name) {
    Dep.target = this // 未订阅标记
    this.name = name
    this.node = node
    this.vm = vm
    this.update() // 初始化视图，触发对应属性的 getter
    Dep.target = null // 已订阅标记
}

Watcher.prototype = {
	update: function() {
        this.node.nodeValue = this.vm[this.name] // 触发对应属性的 getter/setter
    }
}
```
还需要修改一下`defineReactive`函数和`compile`函数
```js	
function defineReactive(obj, key, val) {
    var dep = new Dep() // 实例化一个主题
    Object.defineProperty(obj, key, {
        get: function() {
        	// 添加订阅者到主题
            if (Dep.target) dep.addSub(Dep.target)
            return val
        },
        set: function(newVal) {
            if (newVal === val) return
            val = newVal
            dep.notify() // 发布更新公告
        }
    })
}
```
```js
function compile(node, vm) {
    var reg = /\{\{(.*)\}\}/
    if (node.nodeType === 1) { 
        var attr = node.attributes
        for (var i = 0; i < attr.length; i++) {
            if (attr[i].nodeName == 'v-model') {
                var name = attr[i].nodeValue.trim()
                node.addEventListener('input', function(e) {
                    vm[name] = e.target.value
                });
                node.value = vm[name]
            }
        }
    };
    if (node.nodeType === 3) { 
        if (reg.test(node.nodeValue)) {
            var name = RegExp.$1.trim()
            new Watcher(vm, node, name) // 初始化数据并添加订阅者
        }
    }
}
```
至此我们已经实现了基础的双向绑定功能，具体代码和效果见step3.html。
