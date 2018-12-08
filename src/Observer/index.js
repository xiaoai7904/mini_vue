/*
 * @Author: xiaoai
 * @Date: 2018-11-16 17:50:52
 * @LastEditors: xiaoai
 * @LastEditTime: 2018-12-07 16:22:45
 * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
 */
import { def } from '../Util';
import Dep from './dep';

let sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: function(){},
  set: function(){}
};
export function defineReactive(obj, key, val) {
  // 实例订阅者对象
  const dep = new Dep();
  // 获取对象上面的描述
  const property = Object.getOwnPropertyDescriptor(obj, key);

  if (property && property.configurable === false) {
    return;
  }

  const getter = property && property.get;
  const setter = property && property.set;

  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key];
  }
  var childObj = observe(val);
  Object.defineProperty(obj, key, {
    // 可枚举
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val;
      // 依赖收集
      if (Dep.target) {
        dep.depend();
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val;
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return;
      }
      // 更新值
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      // 新的值是object的话，进行监听
      childObj = observe(newVal);
      // 通知所有订阅者进行视图更新
      dep.notify();
    }
  });
}

// 把computed的属性挂载到minivue实例上
export function defineComputed(target, key, userDef) {
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = createComputedGetter(key);
    sharedPropertyDefinition.set = function() {};
  }

  Object.defineProperty(target, key, sharedPropertyDefinition);
}

export function createComputedGetter(key) {
  return function computedGetter() {
    var watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      // if (watcher.dirty) {
        watcher.get();
      // }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    }
  };
}

class Observer {
  constructor(value) {
    this.value = value;
    this.dep = new Dep();
    this.walk(value);
  }
  /**
   * 给每个数据属性转为为getter/setter，在读取和设置的时候都会进入对应方法进行数据监听和更新
   * @param {Object} obj 监听对象
   */
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }
}

export default function observe(value, vm) {
  if (!value || typeof value !== 'object') {
    return;
  }
  return new Observer(value);
}
