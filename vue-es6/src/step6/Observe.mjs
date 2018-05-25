import Dep from './Dep'
import { arrayMethods } from './array'
import { def } from './util'
/*
确保在调用时，先调用到自定义的方法。有两种方式可以实现：
- 数组对象上直接有该方法，这样就不会去找对象上的原型链
- 覆盖对象的 __proto__ ，这样寻找原型链时，就会先找到我们的方法
*/
// 如果能使用 __proto__ 则将数组的处理方法进行替换
function protoAugment(target, src) {
    target.__proto__ = src
}
// 如果不能使用 __proto__ 则直接将该方法定义在当前对象下
function copyAugment(target, src, keys) {
    for (let i = 0; i < keys.length; i++) {
        def(target, keys[i], src[keys[i]])
    }
}

export function defineReactive(object, key, value) {
    let dep = new Dep()
    let childOb = observe(value)
    Object.defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        get: function () {
            if (Dep.target) {
                dep.addSub(Dep.target)
                Dep.target.addDep(dep)
                // 处理数组的依赖
                if(Array.isArray(value)){
                    childOb.dep.addSub(Dep.target)
                    Dep.target.addDep(childOb.dep)
                }
            }
            return value
        },
        set: function (newValue) {
            if (newValue !== value) {
                value = newValue
                dep.notify()
            }
        }
    })
}

export class Observer {

    constructor(value) {
        this.value = value
        def(value, '__ob__', this)
        if (Array.isArray(value)) {
            this.dep = new Dep()
            const augment = ('__proto__' in {}) ? protoAugment : copyAugment
            // 覆盖数组中一些改变了原数组的方法，使得方法得以监听
            augment(value, arrayMethods, Object.keys(arrayMethods))
            this.observeArray(value)
        } else {
            this.walk(value)
        }
    }

    /**
     * 遍历对象下属性，使得属性变成可监听的结构
     */
    walk(obj) {
        const keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]])
        }
    }

    /**
     * 同上，遍历数组
     */
    observeArray (items) {
        for (let i = 0, l = items.length; i < l; i++) {
            observe(items[i])
        }
    }

}

export function observe (value) {
    if (typeof value !== 'object') return
    let ob
    if (value.hasOwnProperty('__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__
    } else if (Object.isExtensible(value)) {
        ob = new Observer(value)
    }
    return ob
}
