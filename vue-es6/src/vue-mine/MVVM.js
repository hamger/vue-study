import observer from './observer'
import Compiler from './compiler'

class MVVM {
	constructor (options) {
		this.data = options.data
		// 监听数据
		observer(this.data,this)

		// 编译节点,更新view
		new Compiler(options.el || document.body,this)
	}
}

window.MVVM = MVVM
