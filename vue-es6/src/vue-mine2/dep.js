let uid = 0;

export default class Dep {
    static target;

    constructor () {
        this.id = uid++;
        this.subs = [];
    }

    addSub (sub) { // 添加订阅者
        this.subs.push(sub); 
    }

    removeSub (sub) { // 取消订阅
        let index = this.subs.indexOf(sub);
        if (index != -1) {
            this.subs.splice(index, 1);
        }
    }

    depend () { // 添加自身
        Dep.target.addDep(this); 
    }

    notify () { // 主题发布更新公告
        this.subs.forEach(sub => sub.update());
    }
}
