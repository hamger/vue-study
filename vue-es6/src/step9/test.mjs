import {Vue} from "./Vue";

let test = new Vue({
    data() {
        return {
            baseTest: 'baseTest',
            objTest: {
                stringA: 'stringA',
                stringB: 'stringB'
            }
        }
    },
    methods: {
        methodTest() {
            console.log('methodTest')
            this.$emit('eventTest', '事件测试')
        }
    },
    watch: {
        'baseTest'(newValue, oldValue) {
            console.log(`baseTest change ${oldValue} => ${newValue}`)
        },
        'objTest.stringA'(newValue, oldValue) {
            console.log(`objTest.stringA change ${oldValue} => ${newValue}`)
        }
    }
})

test.$on('eventTest', function (event) {
    console.log(event)
})

console.log(test.baseTest)
// baseTest

test.methodTest()
// methodTest
// 事件测试

test.baseTest = 'baseTestChange'
// baseTest change baseTest => baseTestChange

test.objTest.stringA = 'stringAChange'
// objTest.stringA change stringA => stringAChange