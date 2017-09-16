export default class Dep {
	static target; // 静态属性，防止重复添加订阅订阅者

    constructor (){
        this.subs = [] // 订阅者集合，订阅者是 Watcher 的实例
    }

    // 添加订阅者，使用在 getter 函数中，（见 ./observer.js 文件）
    addSub(sub) { 
        this.subs.push(sub)
    }

    // 发布公告，使用在 setter 函数中，（见 ./observer.js 文件）
    notify() {
        this.subs.forEach(sub => {
            sub.update() // 订阅者自我更新，（见 ./watcher.js 文件）
        })
    }
}
