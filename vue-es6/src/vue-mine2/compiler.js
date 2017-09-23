import Watcher from './watcher'
import observer from './observer'

// 定义解析含标识符文本的正则
const tagRE = /\{\{\{(.*?)\}\}\}|\{\{(.*?)\}\}/g,
    htmlRE = /^\{\{\{(.*)\}\}\}$/,
    paramsRE = /\((.+)\)/g,
    stringRE = /\'(.*)\'/g


export default class Compiler {

    constructor(el, vm) {
        this.$vm = vm
        this.$el = this.isElementNode(el) ? el : document.querySelector(el)

        if (this.$el) {
            // 将 DOM 转化为文档片段
            this.$fragment = this.createFragment(this.$el)
            // 编译文档片段，编译器的核心入口
            this.compileElement(this.$fragment)
            // 将编译后的文档片段添加到目标 DOM 中
            this.$el.appendChild(this.$fragment)
        }
    }

    /*
    创建文档片段
    */
    createFragment(el) {
        var fragment = document.createDocumentFragment(),
            child
        // 遍历原始node子节点，appendchild 方法会自动删除 node 对象的 child 节点
        // （一个字节点有且仅有一个父节点）
        // 这里只是遍历子节点，在 compileNodeAttr 函数中会递归遍历后代节点
        while (child = el.firstChild) {
            fragment.appendChild(child)
        }

        return fragment
    }

    /*
    编译文档片段
    */
    compileElement(el) {
        let childNodes = el.childNodes,
            self = this
        // 将子元素转化为数组，遍历之
        [].slice.call(childNodes).forEach(function (node) {
            var text = node.textContent
            var reg = /\{\{(.*)\}\}/g
            // 如果 node 类型为元素
            if (self.isElementNode(node)) { 
                self.compileNodeAttr(node)  
            // 如果 node 类型为文本，且存在 {{ }} 文本标识符
            } else if (self.isTextNode(node) && reg.test(text)) {
                self.compileText(node)
            }
        })
    }

    /*
    编译节点属性
    */
    compileNodeAttr(node) {
        // 获得元素节点的所有属性
        let nodeAttrs = node.attributes,
            self = this,
            lazyComplier,
            lazyExp

        // 将所有属性转化为数组，遍历之
        [].slice.call(nodeAttrs).forEach(function (attr) {
            let attrName = attr.name
            // 是否存在合法指令
            if (self.isDirective(attrName)) {
                let expression = attr.value
                // 得到指令（去除"v-"的部分）
                let directive = attrName.substring(2)
                // 如果指令是"for"(for循环)
                if (directive === 'for') {
                    // 储存指令
                    lazyComplier = directive
                    // 储存表达式
                    lazyExp = expression
                // 如果指令是事件指令
                } else if (self.isEventDirective(directive)) {
                    // 添加该事件
                    directiveUtil.addEvent(node, self.$vm, directive, expression)
                // 其他指令
                } else {
                    directiveUtil[directive] && directiveUtil[directive](node, self.$vm, expression)
                }
                // 用完指令后移除，防止渲染在 DOM 上
                node.removeAttribute(attrName)
            }
        });

        if (lazyComplier === 'for') {
            // 执行 for 循环
            directiveUtil[lazyComplier] && directiveUtil[lazyComplier](node, this.$vm, lazyExp)
        } else if (node.childNodes && node.childNodes.length) {
            // 递归编译文档片段，直到没有元素节点
            self.compileElement(node)
        }
    }

    /*
    编译文本节点
    */
    compileText(node) {
        // 获得文本解析后的一个数组
        const tokens = this.parseText(node.wholeText)
        let fragment = document.createDocumentFragment()
        tokens.forEach(token => {
            let el
            // 需要编译的文本
            if (token.tag) {
                // HTML 文本
                if (token.html) {
                    el = document.createDocumentFragment()
                    el.$parent = node.parentNode
                    el.$oncetime = true
                    // 进行监听并赋值
                    directiveUtil.html(el, this.$vm, token.value)
                // 普通文本
                } else {
                    el = document.createTextNode(" ")
                    // 进行监听并赋值
                    directiveUtil.text(el, this.$vm, token.value)
                }
            // 不需要编译的文本
            } else {
                el = document.createTextNode(token.value)
            }
            el && fragment.appendChild(el)
        })
        // 更新节点的子节点
        node.parentNode.replaceChild(fragment, node)
    }

    /*
    解析文本内容，返回一个数组
    */
    parseText(text) {
        if (!tagRE.test(text)) {
            return
        }
        const tokens = []
        let lastIndex = tagRE.lastIndex = 0
        let match, index, html, value
        while (match = tagRE.exec(text)) {
            index = match.index
            // 获取 {{}} 或者 {{{}}} 之前的文本
            if (index > lastIndex) {
                tokens.push({
                    value: text.slice(lastIndex, index)
                });
            }

            // 获取 {{}} 或者 {{{}}} 中的文本
            html = htmlRE.test(match[0])
            // 如果是 {{{}}} 则为 HTML 文本 ，否则为普通文本
            value = html ? match[1] : match[2]
            tokens.push({
                value: value,
                // 标识是否为需要编译的文本
                tag: true,
                // 标识是否为 HTML 文本
                html: html 
            });
            lastIndex = index + match[0].length
        }
        // 获取 {{}} 或者 {{{}}} 之后的文本
        if (lastIndex < text.length) {
            tokens.push({
                value: text.slice(lastIndex)
            })
        }
        return tokens 
    }

    /*
    是否存在 v 指令
    */
    isDirective(attr) {
        return attr.indexOf('v-') === 0
    }

    /*
    是否存在 on 指令
    */
    isEventDirective(dir) {
        return dir.indexOf('on') === 0
    }

    /*
    是否是元素节点
    */
    isElementNode(node) {
        return node.nodeType === 1
    }
    /*
    是否是文本节点
    */
    isTextNode(node) {
        return node.nodeType === 3
    }
}


// 指令工具函数集合
const directiveUtil = {
    text: function (node, vm, expression) {
        this.bind(node, vm, expression, 'text');
    },

    html: function (node, vm, expression) {
        this.bind(node, vm, expression, 'html');
    },

    class: function (node, vm, expression) {
        this.bind(node, vm, expression, 'class');
    },

    for: function (node, vm, expression) {
        let itemName = expression.split('in')[0].replace(/\s/g, ''),
            arrayName = expression.split('in')[1].replace(/\s/g, '').split('.'),
            parentNode = node.parentNode,
            startNode = document.createTextNode(''),
            endNode = document.createTextNode(''),
            range = document.createRange();

        parentNode.replaceChild(endNode, node);
        parentNode.insertBefore(startNode, endNode);

        let value = vm;
        arrayName.forEach(function (curVal) {
            value = value[curVal];
        });

        value.forEach(function (item, index) {
            let cloneNode = node.cloneNode(true);
            parentNode.insertBefore(cloneNode, endNode);
            let forVm = Object.create(vm);
            forVm.$index = index;
            forVm[itemName] = item;
            new Compiler(cloneNode, forVm);
        });

        new Watcher(vm, arrayName + ".length", function (newValue, oldValue) {
            range.setStart(startNode, 0);
            range.setEnd(endNode, 0);
            range.deleteContents();
            value.forEach((item, index) => {
                let cloneNode = node.cloneNode(true);
                parentNode.insertBefore(cloneNode, endNode);
                let forVm = Object.create(this);
                forVm.$index = index;
                forVm[itemName] = item;
                new Compiler(cloneNode, forVm);
            });
        });
    },

    model: function (node, vm, expression) {
        this.bind(node, vm, expression, 'model');

        let value = this._getVMVal(vm, expression);

        let composing = false;

        node.addEventListener('compositionstart', () => {
            composing = true;
        }, false);

        node.addEventListener('compositionend', event => {
            composing = false;
            if (value !== event.target.value) {
                this._setVMVal(vm, expression, event.target.value);
            }
        }, false);

        node.addEventListener('input', event => {
            if (!composing && value !== event.target.value) {
                this._setVMVal(vm, expression, event.target.value);
            }
        }, false);
    },

    bind: function (node, vm, expression, directive) {
        var updaterFn = updater[directive + 'Updater'];
        let value = this._getVMVal(vm, expression);
        updaterFn && updaterFn(node, value);
        // 监听数据并更新数据
        new Watcher(vm, expression, function (newValue, oldValue) {
            updaterFn && updaterFn(node, newValue, oldValue);
        });
    },

    addEvent: function (node, vm, directive, expression) {
        let eventType = directive.split(':');
        let fn = vm.$options.methods && vm.$options.methods[expression];

        if (eventType[1] && typeof fn === 'function') {
            node.addEventListener(eventType[1], fn.bind(vm), false);
        } else {
            let match = paramsRE.exec(expression),
                fnName = expression.replace(match[0], ''),
                paramNames = match[1].split(','),
                params = [];

            paramsRE.exec("remove(todo)");
            fn = vm.$options.methods[fnName];
            for (let i = 0; i < paramNames.length; i++) {
                let name = paramNames[i].trim(),
                    stringMatch = stringRE.exec(name);
                if (stringMatch) {
                    params.push(stringMatch[1]);
                } else {
                    params.push(vm[name]);
                }
                
            }
            node.addEventListener(eventType[1], function () {
                fn.apply(vm, params);
            }, false);
        }
    },

    /*
    获取 vm 上的数据
    */
    _getVMVal: function (vm, expression) {
        expression = expression.trim()
        let value = vm
        // 处理 data.data2.data3 类似的多层对象
        expression = expression.split('.')
        expression.forEach((key) => {
            if (value.hasOwnProperty(key)) {
                // 下次遍历的时候 value 的值也将改变
                // 正好可以用来获取多层的对象属性值
                value = value[key]; 
            } else {
                throw new Error("can not find the property: " + key)
            }
        });

        if (typeof value === 'object') {
            return JSON.stringify(value)
        } else {
            return value
        }
    },

    /*
    变更 vm 上的数据
    */
    _setVMVal: function (vm, expression, value) {
        expression = expression.trim();
        let data = vm._data;
        expression = expression.split('.');
        expression.forEach((key, index) => {
            // 当遍历到最后一个属性的时候进行赋值
            if (index == expression.length - 1) {
                data[key] = value
            // 如果不是最后一个属性则改变 data
            } else {
                data = data[key]
            }
        });
    }
}

// 创建容器元素
const cacheDiv = document.createElement('div')

// 更新方法集合
const updater = {
    textUpdater: function (node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value
    },

    htmlUpdater: function (node, value) {
        if (node.$parent) {
            cacheDiv.innerHTML = value;
            const childNodes = cacheDiv.childNodes,
                doms = [];
            let len = childNodes.length,
                tempNode;
            if (node.$oncetime) {
                while (len--) {
                    tempNode = childNodes[0];
                    node.appendChild(tempNode);
                    doms.push(tempNode);
                }
                node.$doms = doms;
                node.$oncetime = false;
            } else {
                let newFragment = document.createDocumentFragment();
                while (len--) {
                    tempNode = childNodes[0];
                    newFragment.appendChild(tempNode);
                    doms.push(tempNode);
                }
                node.$parent.insertBefore(newFragment, node.$doms[0]);
                node.$doms.forEach(childNode => {
                    node.$parent.removeChild(childNode);
                });
                node.$doms = doms;
            }

        } else {
            node.innerHTML = typeof value === 'undefined' ? '' : value;
        }
    },

    classUpdater: function (node, value, oldValue) {
        var nodeNames = node.className;
        if (oldValue) {
            nodeNames = nodeNames.replace(oldValue, '').replace(/\s$/, '');
        }
        var space = nodeNames && value ? ' ' : '';
        node.className = nodeNames + space + value;
    },

    modelUpdater: function (node, value) {
        node.value = typeof value === 'undefined' ? '' : value;
    },
}
