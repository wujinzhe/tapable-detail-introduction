# Tapable

Tapable是一个包含多个钩子的库，我们可以为插件来创建一些钩子

```JS
const {
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	SyncLoopHook,
	AsyncParallelHook,
	AsyncParallelBailHook,
	AsyncSeriesHook,
	AsyncSeriesBailHook,
	AsyncSeriesWaterfallHook
} = require("tapable");
```

# 安装
```sh
npm install --save tapable
```

# 入门使用

所有钩子的构造函数都采用一个可选参数，该参数是字符串形式的参数名称的列表。

```JS
const { SyncHook } = require('tapable')
const hook = SyncHook(['a', 'b', 'c'])

hook.tap('first', (a, b, c) => {
  console.log('first', a, b, c)
})

hook.tap('second', (a, b, c) => {
  console.log('second', a, b, c)
})

hook.tap('third', (a, b, c) => {
  console.log('third', a, b, c)
})

hook.call(1, 2, 3)

/*
输出
console.log('first', 1, 2, 3)
console.log('second', 1, 2, 3)
console.log('third', 1, 2, 3)

*/
```

Hook将编译一种具有最有效的插件运行方法的方法。它生成代码与以下几点有关：

* 已注册插件的数量（无，一个，很多）
* 已注册插件的类型（同步，异步，Promise）
* 使用的调用方法（同步，异步，Promise）
* 参数个数
* 是否使用拦截

这样可以确保最快的执行速度。

# 钩子类型

每一个钩子都可以注册一个或者多个回调函数，函数的执行方式取决于钩子类型

* 基础钩子（名称中不带"Waterfall", "Bail", "Loop"的钩子），这个钩子只是简单的连续调用每一个函数

* 瀑布式钩子（Waterfall），瀑布式钩子也是连续调用每个函数，但与基础钩子不同的是，它会将每个函数的返回值当做下一个函数的参数

* 可中断式钩子（Bail），这个钩子允许提前退出，当任何一个被注册的函数有返回（返回任何值都算）时，则该钩子停止执行剩下的函数

* 循环式钩子（Loop），当一个插件在循环钩子返回一个非undefined的值时，钩子将从第一个插件重新开始一直循环，直到所有插件返回undefined

此外，挂钩可以是同步的或异步的。为了体现这一点，提供了"Sync", "AsyncSeries"和"AsyncParallel"挂钩类：

* Sync - 同步，只能用tap来注册一个同步函数（比如：myHook.tap()）

* AsyncSeries - 异步串行，一个AsyncSeries类型同步的，基于许回调系和功能（使用被分接myHook.tap()，myHook.tapAsync()和myHook.tapPromise()）。他们连续调用每个异步方法。

# 拦截器
所有的钩子都有提供拦截器API：

call：钩子触发时，将(...args) => void添加call到拦截器中。您可以访问hooks参数。

tap：插件插入钩子时，将触发(tap: Tap) => void添加tap到拦截器中。提供的是Tap对象。Tap对象无法更改。

loop：(...args) => void添加loop到您的拦截器将为循环钩子的每个循环触发。

register：(tap: Tap) => Tap | undefined添加register到您的拦截器将触发每个添加的拦截器，Tap并允许对其进行修改。