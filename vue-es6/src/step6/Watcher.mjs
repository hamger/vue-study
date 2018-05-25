import Dep from './Dep'

let uid = 0

export default class Watcher {

    constructor(object, getter, callback) {
        this.id = ++uid
        this.obj = object
        this.getter = getter
        this.cb = callback
        this.deps = []
        this.value = this.get()
    }

    // 开启监听
    get() {
        Dep.target = this
        let value = this.getter.call(this.obj)
        Dep.target = null
        return value
    }

    // 更新值
    update() {
        const value = this.getter.call(this.obj)
        const oldValue = this.value
        this.value = value
        this.cb.call(this.obj, value, oldValue)
    }

    // 添加依赖
    addDep(dep) {
        this.deps.push(dep)
    }

    // 取消监听
    teardown() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].removeSub(this)
        }
        this.deps = []
    }

    // 重新监听
    reset() {
        this.get()
    }
}
