let uid = 0

export class Event {
    constructor () {
        this.id = ++uid
        this._events = {}
    } 

    // 添加事件
    $on(eventName, fn) {
        let object = this;
        // 若 _events 对象下无对应事件名，则新建一个数组，然后将处理函数推入数组
        (object._events[eventName] || (object._events[eventName] = [])).push(fn)
        return object
    }

    // 添加只触发一次的事件    
    $once(eventName, fn) {
        let object = this
        function cb () {
            // 先取消，然后触发，实现仅触发一次
            object.$off(eventName)
            fn.apply(object, arguments)
        }
        object.$on(eventName, cb)
        return object
    }

    // 取消事件
    $off(eventName) {
        let object = this
        if (object._events[eventName]) {
            object._events[eventName] = null
        }
        return object
    }

    // 触发事件
    $emit(eventName, ...args) {
        let object = this
        let cbs = object._events[eventName]
        // 触发所有该事件下的回调
        if (cbs) cbs.forEach(func => func.apply(object, args))
        return object
    }
}