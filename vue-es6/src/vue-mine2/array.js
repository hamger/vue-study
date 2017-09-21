import { def } from './util';

const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto);

// 使用 arrayMethods 代理原始的数组方法，使其可遍历
[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
].forEach(function(method) {
    const original = arrayProto[method]; // 数组方法
    def(arrayMethods, method, function() {
        // 创建一个数组，代理arguments
        let i = arguments.length;
        const args = new Array(i);
        while(i--) {
            args[i] = arguments[i];
        }

        const result = original.apply(this, args); // 挂载数组方法
        const ob = this.__ob__; // ob是每个数组对象对应的obeserver对象
        let inserted;
        switch(method) {
            case 'push':
                inserted = args;
                break;
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2);
                break;
        }

        // 如果监听的data中的对象有push,unshift,splice等添加新值的方法，就监听新值
        if (inserted) ob.observerArray(inserted);
        // 每次使用数组方法，都触发数组对象的dep发布事件
        ob.dep.notify();
        return result; // 返回数组处理方法
    });
});
