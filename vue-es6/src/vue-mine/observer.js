import Dep from './dep'

// 遍历 vm.data 的所有属性
export default function observer (obj,vm) {
	Object.keys(obj).forEach(key => { 
		defineReactive(vm,key,obj[key])
	})
}

// 使用 Object.defineProperty 把这些属性全部转为 getter/setter
function defineReactive (obj,key,val) { 
	// 实例化一个主题，每个属性都有一个 dep
	var dep = new Dep()
	Object.defineProperty(obj,key,{
		get:function () {
			// 初始化时添加订阅者
			if(Dep.target){
				dep.addSub(Dep.target) 
			}
			return val
		},
		set:function (newVal) {
			if (val === newVal) {
				// 数据无变化直接返回
				return
			}
			val = newVal
			// 发布更新公告
			dep.notify() 
		}
	})
}
