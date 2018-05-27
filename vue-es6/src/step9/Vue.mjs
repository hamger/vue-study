import {Event} from "../util/Event";
import {observe} from "../util/Observe";
import Watcher from "../util/Watcher";


export function proxy(target, sourceKey, key) {
    const sharedPropertyDefinition = {
        enumerable: true,
        configurable: true,
        get() {
        },
        set() {
        }
    }
    sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter(val) {
        this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

let uid = 0

export class Vue extends Event {
    constructor(options) {
        super()
        this._init(options)
    }

    _init(options) {
        let vm = this
        vm.uid = uid++

        if (options.methods) {
            for (let key in options.methods) {
                vm[key] = options.methods[key].bind(vm)
            }
        }
        // 由于 data 是个函数，所以需要调用，并绑定上下文环境
        vm._data = options.data.call(vm)
        // 将 vm._data 变成可监听结构，实现 watcher 的添加
        observe(vm._data)
        // 代理属性，这保证了监听结构是一个完成的对象
        for (let key in vm._data) {
            proxy(vm, '_data', key)
        }

        for (let key in options.watch) {
            // 参一：watcher 的运行环境
            // 参二：获取注册该 watcher 属性
            // 参三：触发监听时的回调
            new Watcher(vm, () => {
                return key.split('.').reduce((obj, name) => obj[name], vm)
            }, options.watch[key])
        }

    }
}

