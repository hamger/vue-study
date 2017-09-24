/*
Function : 为 obj.key 赋值并添加属性描述
*/
export function def(obj, key, value, enumerable) {
    Object.defineProperty(obj, key, {
        value: value,
        writeable: true,
        configurable: true,
        enumerable: !!enumerable
    })
}

/*
Function : 函数去抖
Return : Function
Explain : @func 需要去抖函数
  @wait 去抖的时间长度
  @immediate 是否立即执行
*/
export function debounce(func, wait, immediate) {
  var timeout = null
  
  return function () {
    var delay = function () {
      timeout = null
      if (!immediate) {
        func.apply(this, arguments)
      }
    }
    var callnow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(delay ,wait)
    console.log(callnow)
    if (callnow) {
      func.apply(this, arguments)
    }
  }
}
