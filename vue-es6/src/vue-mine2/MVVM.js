import Watcher from './watcher'
import observer from './observer'
import Compiler from './compiler'

class MVVM {

    constructor (options) {
        this.$options = options;
        this._data = this.$options.data;
        var self = this;
        // 遍历 vm.data，并使 vm 代理 vm.data
        Object.keys(this.$options.data).forEach(key => {
            this._proxy(key);
        });
        // 观察 vm
        observer(this._data);

        // 编译节点，解析各种指令，并且将每个 node 节点对应一个 watcher 身份，在收到通知时改变自身视图
        this.$compiler = new Compiler(options.el || document.body, this);
    }

    $watch (expression, callback) {
        new Watcher(this, expression, callback);
    }

    // 代理数据
    _proxy (key) {
        let self = this;
        Object.defineProperty(this, key, {
            configurable: false,
            enumerable: true,
            get() {
                return self._data[key];
            },
            set(value) {
                self._data[key] = value;
            }
        });
    }
}

window.MVVM = MVVM;
