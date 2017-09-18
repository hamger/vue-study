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
中input的value值和{{start}}变为vm.data.start的值，即将model转化为view。我们需要一个方法，该方法可以实现以上的转化，让v-mode="start"和{{start}}绑定到的data中start的值，代码如下，效果参见step1.html。
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
第二步需要实现view层向model层的绑定，当用户输入改变input的值(view层)时，反映到data中(model层)并改变对应的值。
