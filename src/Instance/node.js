/*
 * @Author: xiaoai
 * @Date: 2018-12-06 15:58:11
 * @LastEditors: xiaoai
 * @LastEditTime: 2018-12-06 17:01:38
 * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
 */
// 代码来源:vue源码/vue-dev/src/platforms/web/runtime/node-ops.js
export function createElement (tagName, vnode) {
    const elm = document.createElement(tagName)
    if (tagName !== 'select') {
      return elm
    }
    // false or null will remove the attribute but undefined will not
    if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
      elm.setAttribute('multiple', 'multiple')
    }
    return elm
  }
  
//   export function createElementNS (namespace, tagName) {
//     return document.createElementNS(namespaceMap[namespace], tagName)
//   }
  
  export function createTextNode (text) {
    return document.createTextNode(text)
  }
  
  export function createComment (text) {
    return document.createComment(text)
  }
  
  export function insertBefore (parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode)
  }
  
  export function removeChild (node, child) {
    node.removeChild(child)
  }
  
  export function appendChild (node, child) {
    node.appendChild(child)
  }
  
  export function parentNode (node) {
    return node.parentNode
  }
  
  export function nextSibling (node) {
    return node.nextSibling
  }
  
  export function tagName (node) {
    return node.tagName
  }
  
  export function setTextContent (node, text) {
    node.textContent = text
  }
  
  export function setStyleScope (node, scopeId) {
    node.setAttribute(scopeId, '')
  }

  export default {
    createElement,createTextNode,createComment,insertBefore,removeChild,appendChild,parentNode,nextSibling,tagName,setTextContent,setStyleScope
  }