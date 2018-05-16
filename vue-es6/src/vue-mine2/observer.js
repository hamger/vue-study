import Dep from './dep'
import { def } from './util'
// arrayMethods 是代理了数组方法的对象
import { arrayMethods } from './array'

// 原型继承
function protoAugment(target, src) {
    target.__proto__ = src
}
// 赋值继承
function copyAugment(target, src, keys) {
    for (let i = 0; i < keys.length; i++) {
        def(target, keys[i], src[keys[i]])
    }
}
// obeserver 只监听对象。
export default function observer(data) {
    if (!data || typeof data !== 'object') {
        return
        // 确保了一个对象下的 Observer 仅被实例化一次
    } else if (data.hasOwnProperty("__ob__") && data["__ob__"] instanceof Observer) {
        return
    }
    return new Observer(data)
}

class Observer {
    constructor(data) {
        this.dep = new Dep()
        // 给每个数据一个指向Observer的引用，array.js会用到
        def(data, "__ob__", this)
        this.data = data
        // vm.data中如果存在数组，会在后面的递归中进入下面if这个流程
        if (Array.isArray(data)) {
            const argment = data.__proto__ ? protoAugment : copyAugment
            // 开始覆盖data数组的原生方法
            argment(data, arrayMethods, Object.keys(arrayMethods))
            // 对数组元素遍历下，有元素可能是对象
            this.observerArray(data)
        } else {
            this.walk(data)
        }
    }

    // 遍历对象的所有属性
    walk(data) {
        let self = this
        Object.keys(this.data).forEach(function (key) {
            self.defineReactice(data, key, data[key])
        })
    }

    // 观察数组
    observerArray(items) {
        for (let i = 0; i < items.length; i++) {
            observer(items[i]) // 数组的元素是对象就监听
        }
    }

    /**
     * Define a reactive property on an Object.（952~1006）
     */
    defineReactice(data, key, value) {
        // 每个属性都有一个dep
        let dep = new Dep(),
            descriptor = Object.getOwnPropertyDescriptor(data, key)
        // 如果已经存在访问器且访问器接口的configurable属性为false则直接返回
        if (descriptor && !descriptor.configurable) {
            return
        }
        // 递归监听，若 value 是对象则返回一个监听后的对象，否则返回 undifined
        let childObserver = observer(value)

        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get: function () {
                // 初始化赋值时 Dep.target 指向订阅者
                if (Dep.target) {
                    dep.depend() // 添加 dep，每一个属性都会有一个dep对象
                    if (childObserver) { // 为子数据添加 dep
                        childObserver.dep.depend()
                    }
                }
                return value
            },
            set: function (newValue) {
                if (newValue == value) {
                    return // 数据没有变化直接返回
                }
                if (typeof newValue === 'object') {
                    observer(newValue) // 如果新值是对象观察之
                }
                value = newValue
                dep.notify() // 发布更新公告
            }
        })
    }
}
