import observer from './observer'
import Compiler from './compiler'

class MVVM {
	constructor (options) {
		this.data = options.data
		const id = options.el

		// 监听数据
		observer(this.data,this)

		// 编译节点,更新view
		new Compiler(document.getElementById(id),this)
	}
}

window.MVVM = MVVM