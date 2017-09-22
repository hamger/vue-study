export default class Dep {
    // 静态属性，用来存放订阅者（见 ./watcher.js 文件）
	static target 

    constructor (){
        // 订阅者集合，订阅者是 Watcher 的实例
        this.subs = [] 
    }

    // 添加订阅者，使用在属性的 getter 中（见 ./observer.js 文件）
    addSub(sub) { 
        this.subs.push(sub)
    }

    // 发布公告，使用在属性的 setter 中（见 ./observer.js 文件）
    notify() {
        this.subs.forEach(sub => {
            // 订阅者自我更新（见 ./watcher.js 文件）
            sub.update() 
        })
    }
}
