import Dep from './dep'

export default class Watcher {
    constructor(vm, expression, callback) {
        this.vm = vm
        // 目标数据属性的表达式（key1.key2...）
        this.expression = expression
        this.callback = callback
        // watcher 监听的属性的Id
        this.depIds = {}
        // 备份，以便判断变化
        this.oldValue = this.get()
    }

    // 更新数据并执行回调
    update () {
        let newValue = this.get()
        let oldValue = this.oldValue
        if (newValue !== this.oldValue) {
            // 更新老数据备份
            this.oldValue = newValue
            // 执行回调更新视图
            this.callback.call(this.vm, newValue, oldValue)
        }
    }

    addDep (dep) {
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this) // 添加订阅者
            this.depIds[dep.id] = dep // 增加依赖项
        }
    }

    // 取得 node 的 expresstion 在 vm 中的值   
    get () {
        // 静态属性，指向 Watcher 实例
        Dep.target = this
        // 求值的过程会触发vm属性值的 getter
        let value = this.getVMVal()
        // 置空，防止重复添加订阅者
        Dep.target = null
        return value
    }

    getVMVal () {
        let expression = this.expression.split('.')
        let value = this.vm
        expression.forEach(function (curVal) {
            // 这里取值的过程，会调用到每一个数据的get，根据getter里面的闭包
            // 从而访问到数据的dep,调用dep.depend
            // 属性dep.depend, 进一步调用到Watch的addDep，让watcher添加进去
            value = value[curVal]
        })
        return value
    }
}
