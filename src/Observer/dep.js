/*
 * @Author: xiaoai
 * @Date: 2018-11-15 16:03:18
 * @LastEditors: xiaoai
 * @LastEditTime: 2018-12-08 20:14:58
 * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
 */
let uid = 0;
/**
 * 订阅者Dep
 * 主要作用是用来存放Watcher观察者对象
 */
export default class Dep {
  constructor() {
    // 标示id防止添加重复观察者对象
    this.id = uid++;
    // 存储观察者对象
    this.subs = [];
  }
  /**
   * 添加观察者
   * @param {Watcher对象} sub
   */
  addSub(sub) {
    this.subs.push(sub);
  }
  /**
   * 删除观察者
   * @param {Watcher对象} sub
   */
  removeSub(sub) {
    let [i, len] = [0, this.subs.length];

    for (; i < len; i++) {
      if (this.subs[i].id === sub.id) {
        this.subs.splice(i, 1);
        break;
      }
    }
  }
  /**
   * 依赖收集，当存在Dep.target的时候添加观察者对象
   * addDep方法是挂载在Watcher原型对象上面的,方法内部会调用Dep实例上面的addSub方法
   */
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }
  /**
   * 通知所有订阅者
   * update方法是挂载在Watcher原型对象上面的,方法内部会把需要的更新数据push到异步队列中,等到数据所有操作完成在进行视图更新
   */
  notify() {
    // 拷贝观察者对象
    const subs = this.subs.slice();
    // 循环所有观察者进行更新操作
    subs.map(item => {
      item.update();
      return item;
    });
  }
}

// 依赖收集完需要将Dep.target设为null，防止后面重复添加依赖
Dep.target = null;

const targetStack = []

export function pushTarget(_target) {
    if(Dep.target) {
        targetStack.push(Dep.target) 
    }
    Dep.target = _target
}

export function popTarget() {
    Dep.target = targetStack.pop() 
}