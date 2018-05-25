import { def } from './util'

const arrayProto = Array.prototype
// Object.create 返回一个具有数组原型的新对象
export const arrayMethods = Object.create(arrayProto);

// 改变数组的默认处理，将新添加的对象添加监听
[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
].forEach(function(method) {
    const original = arrayProto[method] // 数组方法

    // let mutator = function (...args) {
    //     const result = original.apply(this, args)
    //     const ob = this.__ob__
    //     let inserted
    //     switch (method) {
    //         case 'push':
    //         case 'unshift':
    //             inserted = args
    //             break
    //         case 'splice':
    //             inserted = args.slice(2)
    //             break
    //     }
    //     if (inserted) ob.observeArray(inserted)
    //     // 触发 notify 方法
    //     ob.dep.notify()
    //     return result
    // }
    // Object.defineProperty(arrayMethods, method, {
    //     value: mutator,
    //     enumerable: false,
    //     writable: true,
    //     configurable: true
    // })
    // 等价于以下代码

    def(arrayMethods, method, function(...args) {
        const result = original.apply(this, args) // 得到方法处理后的结果
        const ob = this.__ob__ // ob是每个数组对象对应的obeserver对象
        let inserted
        switch(method) {
            case 'push':
                inserted = args
                break
            case 'unshift':
                inserted = args
                break
            case 'splice':
                inserted = args.slice(2)
                break
        }
        // 如果监听的data中的对象有 push, unshift, splice 等添加新值的方法，就监听新值
        if (inserted) ob.observeArray(inserted)
        // 每次使用数组方法，都触发数组对象的dep自更新
        ob.dep.notify()
        return result // 返回数组处理结果
    })
})

// 当根据索引给数组赋值时（array[1] = 10），手动调用该函数，监听数组并触发回调
arrayMethods.$apply = function () {
    this.__ob__.observeArray(this)
    this.__ob__.dep.notify()
}
