import Dep from './dep'

export default class Watcher { 
    constructor(vm, node, key) {
        // 静态属性，指向 Watcher 实例
        Dep.target = this 
        this.key = key
        this.node = node
        this.vm = vm
        this.update()
        // 置空，防止重复添加订阅者
        Dep.target = null 
    }

    update() {
        // 此时将触发属性的 getter （见./observer.js 文件）
        this.node.nodeValue = this.vm[this.key] 
    }
}
