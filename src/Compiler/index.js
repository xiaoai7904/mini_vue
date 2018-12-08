/*
 * @Author: xiaoai
 * @Date: 2018-11-17 14:45:25
 * @LastEditors: xiaoai
 * @LastEditTime: 2018-12-08 20:32:48
 * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
 */
import { regExp } from '../Util/regExp';
const singleLabel = ['input', 'br', 'hr'];
/**
 * 编译类
 */
export default class Compiler {
  constructor(vm, options) {
    this.vm = vm;
    this.ast = {};
    this.$optins = options;
    // 获取需要编译的dom
    this.$el = document.querySelector(options.el);
    // render
    this.$el.outerHTML && this.compileToFunctions(this.$el.outerHTML);
  }
  /**
   * 将vue中dom编译成render函数
   * @param template String dom字符串
   */
  compileToFunctions(template) {
    this.template = template;
    // 会用正则等方式解析template模板中的指令、class、style等数据，形成AST
    this._convertHtml2Ast();
    // 将AST转化成render字符串
    this.render = this._converCode(this.ast);
  }
  /**
   * 遍历dom字符串记录当前位置和删除已经遍历过的dom
   * @param {Number} n 当前dom字符串下标
   */
  _advance(n) {
    this.index += n;
    this.template = this.template.substring(n);
  }
  /**
   * 处理开始标签
   */
  _parseStartTag() {
    let start = this.template.match(regExp.startTagOpen);
    if (start) {
      let match = {
        tagName: start[1],
        attrs: [],
        start: this.index
      };
      this._advance(start[0].length);
      var end, attr;
      while (!(end = this.template.match(regExp.startTagClose)) && (attr = this.template.match(regExp.attribute))) {
        this._advance(attr[0].length);
        match.attrs.push(attr);
      }
      // 如果当前标签是否是以 > 结尾
      if (end) {
        match.unarySlash = end[1];
        this._advance(end[0].length);
        match.end = this.index;
        return match;
      }
    }
  }
  /**
   * 处理结束标签
   */
  _parseEndTag() {
    // 获取当前栈中最后一个元素
    let element = this.stack[this.stack.length - 1];
    let lastNode = element.children[element.children.length - 1];

    // 如果是注释文本就删除
    if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
      element.children.pop();
    }

    // 出栈
    this.stack.length -= 1;
    this.currentParent = this.stack[this.stack.length - 1];
  }
  /**
   * 处理开始标签中的匹配到属性添加ast中
   * @param Object startTagMatch<{attrs:Array,tagName: String, start: Number, end: Number}>
   */
  _handleStartTag(startTagMatch) {
    let attrs = [];

    // 当前标签是否是以 > 结尾的flag
    this.unary = !!startTagMatch.unarySlash;
    startTagMatch.attrs.map(item => {
      attrs.push({
        name: item[1],
        value: item[3] || item[4] || item[5] || ''
      });
    });
    let element = this._createASTElement(startTagMatch, attrs, this.currentParent);
    // 创建ast
    if (!this.ast) {
      this.ast = element;
    }

    if (this.currentParent) {
      this.currentParent.children.push(element);
      element.parent = this.currentParent;
    }

    // 如果不是结束 > 标签就添加到堆栈中和记录当前父级
    if (!this.unary && singleLabel.indexOf(element.tag) < 0) {
      this.stack.push(element);
      this.currentParent = element;
    }
  }
  /**
   * 创建ast树
   * @param {Object} startTagMatch
   * @param {Array} attrs
   * @param {Object} parent
   */
  _createASTElement(startTagMatch, attrs, parent) {
    // 根元素 type为1
    var class2styleExpReg = /^:(class|style)$/;
    var class2styleReg = /^(class|style)$/;
    var map = {};
    var event = {};
    var _attrs = [];
    var props = [];
    var directives = [];
    var isEvent = false;
    var staticClass, staticStyle, styleBinding, classBinding;

    for (var i = 0, l = attrs.length; i < l; i++) {
      map[attrs[i].name] = attrs[i].value;
      /**
       * 1.匹配 @ 符号表示是绑定事件
       * 2.匹配 :class :style 表达式class和表达式style
       * 3.匹配 class style 静态class和静态style
       * 4.普通数据(如: id)
       */
      if (attrs[i].name.match(/^@/g)) {
        isEvent = true;
        event[attrs[i].name.match(/\w*$/)[0]] = { value: attrs[i].value };
      } else if (class2styleReg.test(attrs[i].name)) {
        attrs[i].name.indexOf('class') > -1 ? (staticClass = attrs[i].value) : (staticStyle = attrs[i].value);
      } else if (class2styleExpReg.test(attrs[i].name)) {
        attrs[i].name.indexOf(':class') > -1 ? (classBinding = attrs[i].value) : (styleBinding = attrs[i].value);
      } else if (attrs[i].name === 'v-model') {
        isEvent = true;
        event['input'] = { value: `function($event){if($event.target.composing)return;${attrs[i].value}=$event.target.value}` };

        props.push({
          name: 'value',
          value: `(${attrs[i].value})`
        });

        directives.push({
          arg: null,
          modifiers: undefined,
          name: 'model',
          rawName: 'v-model',
          value: attrs[i].value
        });
      } else {
        _attrs.push({
          name: attrs[i].name,
          value: attrs[i].value
        });
      }
    }
    // 默认根ast数据结构
    var astMap = {
      type: 1,
      tag: startTagMatch.tagName,
      attrsList: attrs,
      attrsMap: map,
      parent: parent,
      children: []
    };

    // 如果有事件绑定就添加到ast中
    if (isEvent) {
      astMap = Object.assign({}, astMap, { event });
      // 处理v-model指令
      props.length && (astMap = Object.assign({}, astMap, { props, directives }));
    }
    // 属性值
    if (_attrs.length) {
      astMap = Object.assign({}, astMap, { attrs: _attrs });
    }
    // 静态class
    if (staticClass) {
      astMap = Object.assign({}, astMap, { staticClass });
    }
    // 静态样式
    if (staticStyle) {
      astMap = Object.assign({}, astMap, { staticStyle });
    }
    // 表达式样式
    if (styleBinding) {
      astMap = Object.assign({}, astMap, { styleBinding });
    }
    // 表达式class
    if (classBinding) {
      astMap = Object.assign({}, astMap, { classBinding });
    }
    return astMap;
  }
  /**
   * 转换attrs
   * @param {Array} attrs
   * @returns Object
   */
  _makeAttrsMap(attrs) {
    var map = {};
    for (var i = 0, l = attrs.length; i < l; i++) {
      map[attrs[i].name] = attrs[i].value;
    }
    return map;
  }
  /**
   * 处理文本内容
   * @param String text 文本节点内容
   */
  _chars(text) {
    if (!this.currentParent) {
      return;
    }
    let children = this.currentParent.children;
    text = text.trim();

    if (text) {
      var res;
      // 文本节点并且是表达式
      if (text !== ' ' && (res = this._parseText(text))) {
        children.push({
          type: 2,
          expression: res.expression,
          tokens: res.tokens,
          text: text
        });
      } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
        // 普通文本节点
        children.push({
          type: 3,
          text: text
        });
      }
    }
  }
  /**
   * 如果文本中含有{{}}表达式进行转换
   * @param {String} text text 文本节点内容
   */
  _parseText(text) {
    if (!regExp.defaultTagRE.test(text)) {
      return;
    }
    var tokens = [];
    var rawTokens = [];
    var lastIndex = (regExp.defaultTagRE.lastIndex = 0);
    var match, index, tokenValue;
    while ((match = regExp.defaultTagRE.exec(text))) {
      index = match.index;

      if (index > lastIndex) {
        rawTokens.push((tokenValue = text.slice(lastIndex, index)));
        tokens.push(JSON.stringify(tokenValue));
      }
      // 构造表达式
      var exp = match[1].trim();
      tokens.push('_s(' + exp + ')');
      rawTokens.push({ '@binding': exp });
      lastIndex = index + match[0].length;
    }
    if (lastIndex < text.length) {
      rawTokens.push((tokenValue = text.slice(lastIndex)));
      tokens.push(JSON.stringify(tokenValue));
    }
    return {
      expression: tokens.join('+'),
      tokens: rawTokens
    };
  }
  /**
   * html转为Ast
   * @returns Object AST语法树
   */
  _convertHtml2Ast() {
    this.ast = null;
    this.stack = [];
    this.index = 0;

    while (this.template) {
      let textEnd = this.template.indexOf('<');

      if (textEnd === 0) {
        // 如果是注释标签直接跳过编译
        if (regExp.comment.test(this.template)) {
          let commentEnd = this.template.indexOf('-->');
          this._advance(commentEnd + 3);
          continue;
        }

        // 匹配结束标签
        let endTagMatch = this.template.match(regExp.endTag);
        if (endTagMatch) {
          let _index = this.index;
          this._advance(endTagMatch[0].length);
          this._parseEndTag(endTagMatch[1], _index, this.index);
          continue;
        }

        // 匹配开始标签
        let startTagMatch = this._parseStartTag();
        if (startTagMatch) {
          this._handleStartTag(startTagMatch);
          continue;
        }
      }
      var text;
      if (textEnd >= 0) {
        // 匹配标签文本内容
        text = this.template.substring(0, textEnd);
        this._advance(textEnd);
      }

      if (textEnd < 0) {
        text = this.template;
        this.template = '';
      }

      if (text) {
        this._chars(text);
      }
    }
  }
  /**
   * 根据ast转成字符串code
   * html代码:
   * <div id="app">
   *    <span :style="testComputed">{{testData}}</span>
   *    <span @click="clickFn"></span>
   * </div>
   * 转换后的code:
   * _c('div', { attrs: { id: 'app' } }, [_c('span', { style: testComputed }, [_v(_s(testData))]), _c('span', { on: { click: clickFn } })]);
   */
  _converCode(el) {
    let data = this._setGenCode(el);

    let children = this._getChildren(el);

    // 处理文本表达式
    if (!el.tag && el.type === 2) {
      return `_v(${el.expression})`;
    }

    // 处理文本
    if (!el.tag && el.type === 3) {
      return `_v("${el.text}")`;
    }
    return "_c('" + el.tag + "'" + (data ? ',' + data : '') + (children ? ',' + children : '') + ')';
  }
  /**
   * 生成code
   * @param {Object} el ast树
   */
  _setGenCode(el) {
    let data = '{';

    if (el.staticClass) {
      data += `staticClass:"${el.staticClass}",`;
    }
    if (el.classBinding) {
      data += `class:${el.classBinding},`;
    }
    if (el.staticStyle) {
      data += `staticStyle:"${el.staticStyle}",`;
    }
    if (el.styleBinding) {
      data += `style:${el.styleBinding},`;
    }
    // 处理属性
    if (el.attrs) {
      data += `attrs:{${this._genProps(el.attrs)}},`;
    }
    // 处理事件
    if (el.event) {
      data += `on:{${this._genHandlers(el.event)}},`;
    }
    // 处理指令
    if(el.directives) {
      data += `directives:${this._genDirectives(el.directives)},`
    }

    // 处理domProps
    if(el.props) {
      data += `domProps:{${this._genProps(el.props, true)}},`
    }

    data = data.replace(/,$/, '') + '}';

    // 如果没有属性就直接返回空
    if (/^\{\}$/.test(data)) {
      data = '';
    }

    return data;
  }
  /**
   * 处理属性字段
   * @param {Array} props 标签属性元素集合
   */
  _genProps(props, flag) {
    let res = '';
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      {
        flag ? res += '"' + prop.name + '":' + prop.value + ',' : res += '"' + prop.name + '":"' + prop.value + '",';
      }
    }
    return res.slice(0, -1);
  }
  /**
   * 处理事件
   */
  _genHandlers(events) {
    let res = '';
    for (var name in events) {
      res += '"' + name + '":' + events[name].value + ',';
    }
    return res.slice(0, -1);
  }
  /**
   * 处理指令
   * @param {Array} directives 
   */
  _genDirectives(directives) {
    let _code = '['
    directives.map((item,index) => {
      _code += `{name:"${item.name}",rawName:"${item.rawName}",value:(${item.value}),expression:"${item.value}"}${index === directives.length - 1 ? ']': ','}`
    })
    return _code
  }
  /**
   * 处理子节点
   * @param {Object} el 当前节点的Ast树
   */
  _getChildren(el) {
    let children = el.children;
    if (children && children.length) {
      return (
        '[' +
        children.map(item => {
          return this._converCode(item);
        }) +
        ']'
      );
    }
  }
}
