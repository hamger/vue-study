// 创建一个作为容器的元素
const cacheDiv = document.createElement('div')

// 各指令更新数据的方法集合
export default {
    textUpdater: function (node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value
    },

    htmlUpdater: function (node, value) {
        if (node.$parent) {
            cacheDiv.innerHTML = value
            const childNodes = cacheDiv.childNodes,
                doms = []
            let len = childNodes.length,
                tempNode
            if (node.$oncetime) {
                while (len--) {
                    tempNode = childNodes[0]
                    node.appendChild(tempNode)
                    doms.push(tempNode)
                }
                node.$doms = doms
                node.$oncetime = false
            } else {
                let newFragment = document.createDocumentFragment()
                while (len--) {
                    tempNode = childNodes[0]
                    newFragment.appendChild(tempNode)
                    doms.push(tempNode)
                }
                node.$parent.insertBefore(newFragment, node.$doms[0])
                node.$doms.forEach(childNode => {
                    node.$parent.removeChild(childNode)
                })
                node.$doms = doms
            }

        } else {
            node.innerHTML = typeof value === 'undefined' ? '' : value
        }
    },

    classUpdater: function (node, value, oldValue) {
        var nodeNames = node.className
        if (oldValue) {
            nodeNames = nodeNames.replace(oldValue, '').replace(/\s$/, '')
        }
        var space = nodeNames && value ? ' ' : ''
        node.className = nodeNames + space + value
    },

    modelUpdater: function (node, value) {
        node.value = typeof value === 'undefined' ? '' : value
    },
}
