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
  error(err) {
    console.log('err', err)
  },
  result(result) {
    console.log('result', result)
  },
  /** 完成了所有的注册函数的拦截器事件，该钩子没有参数 */
  done() {
    console.log('done 完成了')
  }
});

hook.tap({
  name: 'second',
  stage: 10,
}, (a, b, c) => {
  console.log('second', a, b, c)
  throw new Error('123')
  return 'second'
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

  /**
   * 
   * 
var _context;
var _x = this._x;
var _taps = this.taps;
var _interceptors = this.interceptors;
_interceptors[0].call(a, b, c);
var _tap0 = _taps[0];
_interceptors[0].tap(_tap0);
var _fn0 = _x[0];
_fn0(a, b, c);
var _tap1 = _taps[1];
_interceptors[0].tap(_tap1);
var _fn1 = _x[1];
_fn1(a, b, c);
var _tap2 = _taps[2];
_interceptors[0].tap(_tap2);
var _fn2 = _x[2];
_fn2(a, b, c);
_interceptors[0].done();
   */


   /**
    * syncHook 只有onDone 拦截器钩子
    */