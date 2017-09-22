import Watcher from './watcher'

export default class Compiler {
    constructor(el, vm) {
        this.$el = document.querySelector(el)
    	// 创建文档片段
    	let flag = document.createDocumentFragment()
    	let child 
        // 编译每个节点，直到 this.$el 下无子节点
    	while(child = this.$el.firstChild){ 
    		this.compile(child,vm)
            // appendchild 方法会自动删除 node 对象的 child 节点
    		flag.appendChild(child) 
    	}
    	this.$el.appendChild(flag)
    }

    // 编译节点
    compile(node, vm) { 
        const reg = /\{\{(.*)\}\}/
        const type = node.nodeType 
        // 该节点为元素节点
        if (type === 1) { 
            const attr = node.attributes
            for (let i = 0; i < attr.length; i++) {
                if (attr[i].nodeName == 'v-model') {
                    const key = attr[i].nodeValue
                    node.addEventListener('input', e => {
                        vm[key] = e.target.value
                    })
                    node.value = vm[key]
                }
            };
        }
        // 该节点为文本节点
        if (type === 3) {
            if (reg.test(node.nodeValue)) {
                const key = RegExp.$1.trim()
                // 初始化数据并添加订阅者
                new Watcher(vm, node, key) 
            }
        }
    }
}
