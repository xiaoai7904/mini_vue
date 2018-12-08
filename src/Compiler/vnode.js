/*
 * @Author: xiaoai
 * @Date: 2018-12-04 19:53:19
 * @LastEditors: xiaoai
 * @LastEditTime: 2018-12-08 20:36:17
 * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
 */

/**
 * 虚拟Dom基类
 */
export default class VNode {
  constructor(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
    /*当前节点的标签名*/
    this.tag = tag;
    /*当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息*/
    this.data = data;
    /*当前节点的子节点，是一个数组*/
    this.children = children;
    /*当前节点的文本*/
    this.text = text;
    /*当前虚拟节点对应的真实dom节点*/
    this.elm = elm;
    /*当前节点的名字空间*/
    this.ns = undefined;
    /*编译作用域*/
    this.context = context;
    /*函数化组件作用域*/
    this.functionalContext = undefined;
    /*节点的key属性，被当作节点的标志，用以优化*/
    this.key = data && data.key;
    /*组件的option选项*/
    this.componentOptions = componentOptions;
    /*当前节点对应的组件的实例*/
    this.componentInstance = undefined;
    /*当前节点的父节点*/
    this.parent = undefined;
    /*简而言之就是是否为原生HTML或只是普通文本，innerHTML的时候为true，textContent的时候为false*/
    this.raw = false;
    /*静态节点标志*/
    this.isStatic = false;
    /*是否作为跟节点插入*/
    this.isRootInsert = true;
    /*是否为注释节点*/
    this.isComment = false;
    /*是否为克隆节点*/
    this.isCloned = false;
    /*是否有v-once指令*/
    this.isOnce = false;
  }
  child() {
    return this.componentInstance;
  }
}
/**
 * 创建空节点
 */
export const createEmptyVNode = (text = '') => {
  const node = new VNode();
  node.text = text;
  node.isComment = true;
  return node;
};
/**
 * 创建文本节点
 */
export function createTextVNode(val) {
  return new VNode(undefined, undefined, undefined, String(val));
}
/**
 * 创建元素
 * @param {Object} context miniVue实例
 * @param {String} tag 标签
 * @param {Object} data 数据
 * @param {Array} children 子节点
 */
export function createElement(context, tag, data, children) {
    var vnode

    if(!tag) {
        createEmptyVNode()
    }
    // 兼容不传data的情况, 处理<span>{{a}}</span>这种dom情况,字符串function为: _c('span', [_v(_s(a))])
    if(Array.isArray(data)) {
        children = data
        data = undefined
    }
    
    if(typeof tag === 'string') {
        vnode = new VNode(tag, data, children, undefined, undefined, context)  
    }

    if(vnode !== undefined) {
        return vnode
    }
}