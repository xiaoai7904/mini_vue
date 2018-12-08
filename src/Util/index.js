/*
 * @Author: xiaoai
 * @Date: 2018-11-15 19:58:29
 * @LastEditors: xiaoai
 * @LastEditTime: 2018-12-06 19:34:55
 * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
 */
import debugUtil from './debug';

export let noop = function(a, b, c) {};

export let callHook = function(vm, hook) {
  let handlers = vm.$options[hook];
  if (handlers) {
    handlers.call(vm);
  }
};
/**
 * 定义属性.
 */
export function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}
export const debug = debugUtil
