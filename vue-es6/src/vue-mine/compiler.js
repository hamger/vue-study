import Watcher from './watcher'

export default class Compiler {
    constructor(node, vm) {
    	// 创建文档碎片节点
    	let flag = document.createDocumentFragment()
    	let child 
    	while(child = node.firstChild){ // 当 node 下无子节点时停止编译
    		this.compile(child,vm)
    		flag.appendChild(child)
    	}
    	node.appendChild(flag)
    }

    // 编译节点
    compile(node, vm) { 
        const reg = /\{\{(.*)\}\}/
        const type = node.nodeType
        if (type === 1) { // 元素节点
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
        if (type === 3) { // 文本节点
            if (reg.test(node.nodeValue)) {
                const key = RegExp.$1.trim()
                new Watcher(vm, node, key)
            }
        }
    }
}
