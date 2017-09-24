let uid = 0 // 主题 ID

export default class Dep {
    static target // 静态属性，用来存放订阅者

    constructor () {
        this.id = uid++
        this.subs = [] // 订阅者集合，订阅者是 Watcher 的实例
    }

    addSub (sub) { // 添加订阅者
        this.subs.push(sub)
    }

    removeSub (sub) { // 取消订阅
        let index = this.subs.indexOf(sub)
        if (index != -1) {
            this.subs.splice(index, 1)
        }
    }

    depend () { // 添加订阅者和依赖项
        Dep.target.addDep(this)
    }

    notify () { // 发布更新公告
        this.subs.forEach(sub => sub.update())
    }
}
