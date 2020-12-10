/**
 * 我们使用tapable 2.0的分支来了解下这个库，并且在tapable的一些关键代码处我已经给出了详细的注释
 */

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
} = require("./tapable/lib/index");

const syncHook = SyncHook(['a', 'b', 'c'])

syncHook.tap('one', (a, b, c) => {
  console.log('one', a, b, c)
})

syncHook.tap('two', (a, b, c) => {
  console.log('two', a, b, c)
})

syncHook.tap('three', (a, b, c) => {
  console.log('three', a, b, c)
})

syncHook.call(1,2,3)