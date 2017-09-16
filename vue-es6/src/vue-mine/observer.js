import Dep from './dep'

export default function observer (obj,vm) {
	Object.keys(obj).forEach(key => { // 遍历对象属性
		defineReactive(vm,key,obj[key])
	})
}

// 定义响应式数据，将 data 放到 vm 下
function defineReactive (obj,key,val) { 
	// 定义一个主题实例
	var dep = new Dep()
	Object.defineProperty(obj,key,{
		get:function () {
			if(Dep.target){
				dep.addSub(Dep.target) // 添加这个属性为订阅者
			}
			return val
		},
		set:function (newVal) {
			if (val === newVal) {
				return
			}
			val = newVal
			dep.notify() // 发布更新公告
		}
	})
}