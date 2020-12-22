/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const Hook = require("./Hook");
const HookCodeFactory = require("./HookCodeFactory");

/**
 * 生成函数代码的类
 */
class SyncHookCodeFactory extends HookCodeFactory {
	content({ onError, onDone, rethrowIfPossible }) {
		return this.callTapsSeries({
			onError: (i, err) => onError(err),
			onDone,
			rethrowIfPossible
		});
	}
}

const factory = new SyncHookCodeFactory();

const TAP_ASYNC = () => {
	throw new Error("tapAsync is not supported on a SyncHook");
};

const TAP_PROMISE = () => {
	throw new Error("tapPromise is not supported on a SyncHook");
};
// 专题2 使用new Function()生成函数来执行
/** 调用代码生成工厂，生成钩子调用call时候调用的函数，也就是compile返回的函数 */
const COMPILE = function(options) {
	/**
	 * 获取注册的函数数组
	 * TODO: 为什么需要一个方法单独来写，直接获取tap.map不是更简单吗
	 */
	factory.setup(this, options);
	// console.log('1', factory.create(options).toString())
	return factory.create(options);
};

function SyncHook(args = [], name = undefined) {
	const hook = new Hook(args, name);
	hook.constructor = SyncHook;

	// 同步的基础钩子不支持异步和Promise调用
	hook.tapAsync = TAP_ASYNC;
	hook.tapPromise = TAP_PROMISE;

	// 生成的函数
	hook.compile = COMPILE;
	return hook;
}
// 专题1 V8引擎中的隐藏类
// refactor hooks to reduce number of hidden maps in methods
// 重构钩子以减少方法中隐藏映射的数量
SyncHook.prototype = null;

module.exports = SyncHook;
