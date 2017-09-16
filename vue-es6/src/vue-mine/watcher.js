import Dep from './dep'

export default class Watcher { 
    constructor(vm, node, key) {
        Dep.target = this // 添加订阅标记
        this.key = key
        this.node = node
        this.vm = vm
        this.update()
        Dep.target = null // 取消订阅标记
    }

    update() {
        this.node.nodeValue = this.vm[this.key] // 此时将触发属性访问器的 getter 函数 （见./observer.js 文件）
    }
}
