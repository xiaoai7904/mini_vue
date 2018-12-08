/*
 * @Author: xiaoai
 * @Date: 2018-11-15 15:56:03
 * @LastEditors: xiaoai
 * @LastEditTime: 2018-12-07 16:15:48
 * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
 */
import Dep, { pushTarget, popTarget } from './dep';

import { noop, debug } from '../Util';

let uid = 0;
/**
 * 观察者 Watcher
 * 主要作用是进行依赖收集的观察者和更新视图
 * 当依赖收集的时候会调用Dep对象的addSub方法，在修改data中数据的时候会触发Dep对象的notify，通知所有Watcher对象去修改对应视图
 */
export default class Watcher {
  /**
   * @param {Object} vm  miniVue实例对象
   * @param {Function} expOrFn watch监听函数
   * @param {Function} cb 回调触发视图更新函数
   */
  constructor(vm, expOrFn, cb = noop) {
    this.vm = vm;
    // 设置id防止重复添加
    this.id = uid++;
    // 保存监听函数为字符串,错误提示会使用
    this.expression = expOrFn.toString();
    // 新的依赖项id集合
    this.newDepIds = new Set();
    // 新的依赖项 临时值在依赖收集完成之后会马上清除
    this.newDeps = [];
    // 添加后的依赖项id集合
    this.depIds = new Set();
    // 添加后的依赖项 依赖收集完成会从newDeps中取出值赋值给自己
    this.deps = [];
    // 回调触发视图更新函数
    this.cb = cb;
    // 获取当前watcher表达式
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      debug('error', this.expression + 'Not a function');
    }
  }
  get() {
    // 更新当前watcher赋值给Dep.target，并且添加到target栈
    pushTarget(this);
    let value = this.getter.call(this.vm, this.vm);
    // 将观察者实例从target栈中取出并设置给Dep.target
    popTarget();
    // 清除依赖
    this.cleanupDeps();
    this.value = value
    return value;
  }
  /**
   * 添加依赖
   * @param {Object} dep Dep实例对象
   */
  addDep(dep) {
    let _id = dep.id;
    // 如果没有添加依赖项就进行添加
    if (!this.newDepIds.has(_id)) {
      this.newDepIds.add(_id);
      this.newDeps.push(dep);
      if (!this.depIds.has(_id)) {
        dep.addSub(this);
      }
    }
  }
  /**
   * 清除依赖收集
   */
  cleanupDeps() {
    /*移除所有观察者对象*/
    let i = this.deps.length;
    while (i--) {
      const dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    // 清除所有依赖数据，把newDeps数据赋值给deps存储依赖
    let tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  }
  /**
   * 收集依赖
   */
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }
  /**
   * 触发更新
   */
  update() {
    this.run();
    // queueWatcher(this);
  }
  /**
   * update函数会调该函数进行更新回调
   */
  run() {
    let value = this.get();
    if (value !== this.value) {
      let oldValue = this.value;
      this.value = value;
      this.cb.call(this.vm, value, oldValue);
    }
  }
}
