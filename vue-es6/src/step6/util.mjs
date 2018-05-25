// 为 obj.key 赋值并添加属性描述
export function def(obj, key, value, enumerable) {
    Object.defineProperty(obj, key, {
        value: value,
        writeable: true,
        configurable: true,
        enumerable: !!enumerable
    })
}