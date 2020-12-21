/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const util = require("util");

/** context参数将要被废弃 */
const deprecateContext = util.deprecate(() => {},
"Hook.context is deprecated and will be removed");

/**
 * this._createCall是需要调用this.compile（子类的编译方法）
 * _createCall会返回编译之后的方法，
 * 相当于每次触发回调都是执行的是compile生成之后的方法
 * 
 * CALL_DELEGATE调用方法的委托，因为这个触发的方法是需要编译过后产生的，
 * 就不用每次执行都执行一次生成函数的流程，而是每次都是用生成好的函数
 * 
 */
const CALL_DELEGATE = function(...args) {
	this.call = this._createCall("sync");
	return this.call(...args);
};
const CALL_ASYNC_DELEGATE = function(...args) {
	this.callAsync = this._createCall("async");
	return this.callAsync(...args);
};
const PROMISE_DELEGATE = function(...args) {
	this.promise = this._createCall("promise");
	return this.promise(...args);
};

class Hook {
	constructor(args = [], name = undefined) {
		/**
		 * this.call  this.callAsync  this.promise 是给实例调用的，调用来触发注册的函数
		 */
		this._args = args;
		this.name = name;
		this.taps = []; // 注册了的回调函数数组
		this.interceptors = []; // 拦截器数组

		/** 用作重新编译使用，后面会详细介绍 */
		this._call = CALL_DELEGATE;
		this._callAsync = CALL_ASYNC_DELEGATE;
		this._promise = PROMISE_DELEGATE;

		// 用于触发注册的函数
		this.call = CALL_DELEGATE;
		this.callAsync = CALL_ASYNC_DELEGATE;
		this.promise = PROMISE_DELEGATE;

		/**
		 * 用于动态函数内容的拼接，_x只是注册的函数数组
		 */
		this._x = undefined;

		this.compile = this.compile;
		this.tap = this.tap;
		this.tapAsync = this.tapAsync;
		this.tapPromise = this.tapPromise;
	}

	// 需要继承
	compile(options) {
		throw new Error("Abstract: should be overridden");
	}

	/** 触发注册函数调用的方法 调用子类的compile方法 
	 * this.compile返回的是使用new Function创建的函数
	 * 性能优化，后续作为课题进行讲解
	*/
	_createCall(type) {
		return this.compile({
			taps: this.taps,
			interceptors: this.interceptors, // 拦截器赋值
			args: this._args, // 参数个数
			type: type // 触发类型 tap  tapAsync  tapPromise
		});
	}

	/** 真正的进行注册回调的方法 */
	_tap(type, options, fn) {
		if (typeof options === "string") {
			options = {
				name: options.trim()
			};
		} else if (typeof options !== "object" || options === null) {
			throw new Error("Invalid tap options");
		}
		if (typeof options.name !== "string" || options.name === "") {
			throw new Error("Missing name for tap");
		}
		// context 已经被弃用，将要被删除
		if (typeof options.context !== "undefined") {
			deprecateContext();
		}
		// 将参数都整合到options中
		options = Object.assign({ type, fn }, options);
		/**
		 * 如果拦截器中有register方法，则需要改变options，生成新的options
		 */
		options = this._runRegisterInterceptors(options);

		/**
		 * 使用拦截器修改后的注册方法插入到taps数组中
		 */
		this._insert(options);
	}

	/**
	 * 
	 * 下面的3个tap其实都只是监听事件
	 */
	tap(options, fn) {
		this._tap("sync", options, fn);
	}

	tapAsync(options, fn) {
		this._tap("async", options, fn);
	}

	tapPromise(options, fn) {
		this._tap("promise", options, fn);
	}

	/** 如果拦截器中有register方法，则需要更新每一个tap的options */
	_runRegisterInterceptors(options) {
		/**
		 * 循环拦截器数组
		 * register(tap) {
				console.log('register', tap);
				return tap;
		 * },

			 如果有register函数，则需要改变options，因为register是可以改变
			 原有的注册函数的一些参数
		 * 
		 */
		for (const interceptor of this.interceptors) {
			if (interceptor.register) {
				/**
				 * 如果有返回内容，则改变之前的options(tap)，否则保持不变
				 */
				const newOptions = interceptor.register(options);
				if (newOptions !== undefined) {
					options = newOptions;
				}
			}
		}
		return options;
	}

	/** 只有在multiHook钩子中使用到，可以稍微往后放 */
	withOptions(options) {
		const mergeOptions = opt =>
			Object.assign({}, options, typeof opt === "string" ? { name: opt } : opt);

		return {
			name: this.name,
			tap: (opt, fn) => this.tap(mergeOptions(opt), fn),
			tapAsync: (opt, fn) => this.tapAsync(mergeOptions(opt), fn),
			tapPromise: (opt, fn) => this.tapPromise(mergeOptions(opt), fn),
			intercept: interceptor => this.intercept(interceptor),
			isUsed: () => this.isUsed(),
			withOptions: opt => this.withOptions(mergeOptions(opt))
		};
	}

	/** 只有在multiHook钩子中使用到，可以稍微往后放, 是否是有用的钩子 */
	isUsed() {
		return this.taps.length > 0 || this.interceptors.length > 0;
	}

	/** 只有在multiHook钩子中使用到，可以稍微往后放 拦截 */
	intercept(interceptor) {
		this._resetCompilation();
		this.interceptors.push(Object.assign({}, interceptor));

		/**
		 * 拦截器的register钩子能够改变tap的函数，所以如果如果有这个选项的话，则需要改变每一个tap注册的函数
		 */
		if (interceptor.register) {
			for (let i = 0; i < this.taps.length; i++) {
				this.taps[i] = interceptor.register(this.taps[i]);
			}
		}
	}

	/** 重新进行一次编译 */
	_resetCompilation() {
		this.call = this._call;
		this.callAsync = this._callAsync;
		this.promise = this._promise;
	}

	/**
	 * 配置对象来改变事件回调的顺序，注册回调事件
	 * @param {Object} item 
	 */
	_insert(item) {
		this._resetCompilation();
		let before;
		if (typeof item.before === "string") {
			before = new Set([item.before]);
		} else if (Array.isArray(item.before)) {
			before = new Set(item.before);
		}
		let stage = 0;
		if (typeof item.stage === "number") {
			stage = item.stage;
		}
		let i = this.taps.length;
		while (i > 0) {
			i--;
			const x = this.taps[i];
			this.taps[i + 1] = x;
			const xStage = x.stage || 0;
			if (before) {
				if (before.has(x.name)) {
					before.delete(x.name);
					continue;
				}
				if (before.size > 0) {
					continue;
				}
			}
			if (xStage > stage) {
				continue;
			}
			i++;
			break;
		}
		this.taps[i] = item;
	}
}

Object.setPrototypeOf(Hook.prototype, null);

module.exports = Hook;
