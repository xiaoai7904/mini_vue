/*
 * @Author: xiaoai
 * @Date: 2018-12-06 17:03:04
 * @LastEditors: xiaoai
 * @LastEditTime: 2018-12-07 21:52:28
 * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
 */
import nodeOptions from './node';
import { callHook } from '../Util';

function createFnInvoker(fns) {
  function invoker() {
    var arguments$1 = arguments;

    var fns = invoker.fns;
    if (Array.isArray(fns)) {
      var cloned = fns.slice();
      for (var i = 0; i < cloned.length; i++) {
        cloned[i].apply(null, arguments$1);
      }
    } else {
      // return handler return value for single handlers
      return fns.apply(null, arguments);
    }
  }
  invoker.fns = fns;
  return invoker;
}

/**
 * element类
 * 根据VNode创建真实dom元素
 */
export default class Element {
  /**
   * @param {element对象} oldElem element元素
   * @param {Object} vnode vnode虚拟dom
   * @param {Object} prevVnode 更新上一次的虚拟dom
   * @param {element对象} parentElm 父元素ele对象
   */
  constructor(vm, oldElem, vnode, prevVnode, parentElm) {
    this.vm = vm;
    if (prevVnode) {
      callHook(vm, 'beforeUpdate');
    }
    this.prevVnode = prevVnode ? prevVnode : { data: {} };
    this.createElement(vnode, parentElm, prevVnode);
    this.removeVnodes(oldElem);
  }
  /**
   * vue diff算法实现
   */
  path() {
    return true;
  }
  /**
   * 删除老元素
   * @param {element对象} oldElem 上一次的元素
   */
  removeVnodes(oldElem) {
    nodeOptions.removeChild(oldElem.parentNode, oldElem);
  }
  /**
   * 根据VNode创建真实dom元素
   * @param {Object} vnode VNode
   * @param {ele} parentElm 父元素
   */
  createElement(vnode, parentElm) {
    this.path();
    // 没有父元素就直接默认body
    if (!parentElm) {
      parentElm = document.querySelector('body');
    }
    let data = vnode.data;
    let children = vnode.children;
    let tag = vnode.tag;

    // 有tag就创建一个标签，没有就当成文本节点创建
    if (tag) {
      vnode.elm = nodeOptions.createElement(tag, vnode);
    } else {
      vnode.elm = nodeOptions.createTextNode(vnode.text);
    }

    // 如果有子元素数据，递归创建子元素
    this.createChildren(vnode, children);

    if (data) {
      this.updateAttrs(this.prevVnode, vnode);
      this.updateClass(this.prevVnode, vnode);
      this.updateDOMListeners(this.prevVnode, vnode);
      this.updateStyle(this.prevVnode, vnode);
    }
    // 添加都对应父元素下面
    if (parentElm !== undefined || parentElm !== null) {
      nodeOptions.appendChild(parentElm, vnode.elm);
    }
  }
  /**
   * 递归创建孩子节点
   * @param {Object} vnode VNode
   * @param {Array} children 孩子VNode
   */
  createChildren(vnode, children) {
    if (Array.isArray(children)) {
      let [i, len] = [0, children.length];
      for (; i < len; i++) {
        this.createElement(children[i], vnode.elm);
      }
    }
  }
  /**
   * 更新元素属性
   * @param oldVnode
   * @param vnode
   */
  updateAttrs(oldVnode, vnode) {
    let elm = vnode.elm;
    let oldAttrs = oldVnode.data.attrs || {};
    let attrs = vnode.data.attrs || {};

    // 整合attrs和domProps
    if(vnode.data.domProps) {
        attrs = Object.assign({}, attrs, vnode.data.domProps)
    }

    var cur, old;
    for (let key in attrs) {
      cur = attrs[key];
      old = oldAttrs[key];
      //   if (old !== cur) {
      elm.setAttribute(key, cur);
      //   }
    }
  }
  /**
   * 更新元素class
   * @param oldVnode
   * @param vnode
   */
  updateClass(oldVnode, vnode) {
    let elm = vnode.elm;
    let oldStaticClass = oldVnode.data.staticClass || '';
    let staticClass = vnode.data.staticClass || '';

    let oldClass = oldVnode.data.class || '';
    let _class = vnode.data.class || '';

    if (staticClass || _class) {
      let _cls = [].concat(staticClass, _class);
      elm.setAttribute('class', _cls.join(' '));
    }
  }
  /**
   * 绑定元素事件
   * @param oldVnode
   * @param vnode
   */
  updateDOMListeners(oldVnode, vnode) {
    let on = vnode.data.on || {};
    let oldOn = oldVnode.data.on || {};
    var cur;
    for (let name in on) {
      cur = createFnInvoker(on[name]);
      vnode.elm.addEventListener(name, cur, false);
    }
  }
  /**
   * 更新元素样式
   * @param oldVnode
   * @param vnode
   */
  updateStyle(oldVnode, vnode) {
    let elm = vnode.elm;
    let oldStaticStyle = oldVnode.data.staticStyle || '';
    let staticStyle = vnode.data.staticStyle || '';

    let oldStyle = oldVnode.data.style || {};
    let _style = vnode.data.style || {};

    // 如果直接写在标签上面的style遍历属性添加到最新的dom上面
    let styleArray = staticStyle.split(';');

    if (styleArray && styleArray.length) {
      styleArray.map(item => {
        let _s = item.split(':');
        if (_s && _s.length) {
          elm.style[_s[0]] = _s[1];
        }
      });
    }

    // 添加样式
    for (let key in _style) {
      elm.style[key] = _style[key];
    }
  }
}
