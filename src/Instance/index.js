/*
 * @Author: xiaoai
 * @Date: 2018-11-15 15:55:52
 * @LastEditors: xiaoai
 * @LastEditTime: 2018-12-08 20:11:27
 * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
 */

import observe, { defineComputed } from '../Observer';

import Compiler from '../Compiler';

import Watcher from '../Observer/watcher';

import Element from './element';

import { createEmptyVNode, createTextVNode, createElement } from '../Compiler/vnode';

import { callHook } from '../Util';

import { version } from '../../package.json';

let uid = 0;

let _version = version
/**
 * 主函数入口
 */
export default class MiniVue {
  constructor(options) {
    if (new.target !== MiniVue) {
      throw new Error('必须使用 new 命令生成实例');
    }
    this.id = uid++;
    this._self = this;
    this.$options = options;
    this.init(options);
  }
  init() {
    let vm = this;
    callHook(vm, 'beforeCreated');
    // 创建元素
    this._c = function(a, b, c, d) {
      return createElement(vm, a, b, c, d);
    };
    // 创建文本节点
    this._v = createTextVNode;
    // 序列化字符串 创建文本节点并且里面含有{{}}表达式，先处理表达式得到值，在进行字符串转换
    this._s = function(val) {
      return val.toString();
    };
    // 初始化data数据，代理数据和数据劫持
    this._initData();
    // 初始化computed
    this._initComputed();
    // 初始化methods
    this._initMethod();
    // 编译render，创建虚拟Dom
    this.mounted();
  }
  /**
   * 代理函数
   * 将data上面的属性代理到了vm实例上,这样就可以用app.text代替app._data.text了
   * @param {Object} target 代理目标对象
   * @param {String} sourceKey 代理key
   * @param {String} key 目标key
   */
  proxy(target, sourceKey, key) {
    let vm = this;
    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: true,
      get: function() {
        return vm[sourceKey][key];
      },
      set: function(val) {
        vm[sourceKey][key] = val;
      }
    });
  }
  /**
   * 初始化data对象数据,收集数据添加监听
   */
  _initData() {
    let vm = this;
    let data = this.$options.data;
    // data支持两种写法(函数和对象)
    // 如果data是函数就直接执行拿到返回值,如果是对象直接返回
    data = vm._data = typeof data === 'function' ? data.call(vm) : data || {};

    const keys = Object.keys(data);
    let i = keys.length;
    while (i--) {
      let key = keys[i];
      this.proxy(vm, '_data', key);
    }
    observe(data, vm);
  }
  /**
   * 初始化methods方法挂载miniVue实例上
   */
  _initMethod() {
    for (let key in this.$options.methods) {
      this[key] = this.$options.methods[key] == null ? noop : this.$options.methods[key].bind(this);
    }
  }
  /**
   * 初始化computed,添加依赖监听
   */
  _initComputed() {
    let vm = this;
    let noop = function() {};
    let watchers = (vm._computedWatchers = Object.create(null));

    if (this.$options.computed) {
      for (let key in this.$options.computed) {
        var userDef = this.$options.computed[key];
        watchers[key] = new Watcher(vm, userDef, noop);

        if (!(key in vm)) {
          defineComputed(vm, key, userDef);
        }
      }
    }
  }
  /**
   * 编译模版
   */
  mounted() {
    let vm = this;
    callHook(vm, 'created');
    if (this.$options.el) {
      callHook(vm, 'beforeMount');
      // 编译template
      let compiler = new Compiler(vm, this.$options);
      // 将AST转化成render function字符串
      this.$options.render = new Function('with(this){return ' + compiler.render + '}');
 
      let updateComponent = function() {
        let prevVnode = vm._vnode;
        let oldElem = document.querySelector(this.$options.el);
        // 根据render function字符串创建VNode虚拟Dom
        vm.vnode = vm.$options.render.call(vm);
        vm._vnode = vm.vnode;
        // 根据VNode创建真实dom元素
        new Element(vm, oldElem, vm.vnode, prevVnode, null);
      };

      // 把渲染函数添加到wather里面，如果有数据更新就重新执行渲染函数进行页面更新
      new Watcher(vm, updateComponent, function() {}).get();
      callHook(vm, 'mounted');
    }
  }
}

