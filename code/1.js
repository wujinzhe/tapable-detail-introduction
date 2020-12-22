const { SyncHook } = require('./tapable/lib/index')
const hook = SyncHook(['a', 'b', 'c'])

hook.tap('first', (a, b, c) => {
  console.log('first', a, b, c)
})

/**
 * 在注册事件时，有两个配置可以改变执行的顺序
 * stage：这个属性的类型是数字，数字越大事件回调执行的越晚。
 * before：这个属性的类型可以是数组也可以是一个字符串，传入的是注册事件回调的名称。
 */

// hook.tap('name')
// hook.tap({
//   name: '',
//   stage: 1,
//   before: hookTapName, // hook tap的名称
// })
hook.intercept({
  // 注册事件时调用，注册时
  register(tap) {
    /**
     * 就是
     */
    console.log('register', tap);
    return tap;
  },
  // 触发事件时调用，触发事件时
  call(...args) {
    console.log('call', args);
  },
  // 在 call 拦截器之后执行，循环钩子的每次循环时调用，在触发事件后，执行回调函数前
  loop(...args) {
    console.log('loop', args);
  },
  // 执行注册事件前调用，执行回调时
  tap(tap) {
    console.log('tap', tap);
  },
});

hook.tap({
  name: 'second',
  stage: 10,
}, (a, b, c) => {
  console.log('second', a, b, c)
})

hook.tap('third', (a, b, c) => {
  console.log('third', a, b, c)
})



hook.call(1,2,3) // call 是触发 tap的

/**
 * 注册事件与触发事件
 * 
 * 注册       触发
 * tap  ->   call
 * tapAsync ->  callAsync
 * tapPromise -> promise
 */

 /**
  * 拦截器可以拦截钩子的各个执行的时机，并且可以在注册的拦截器中来修改注册的事件
  */