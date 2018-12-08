(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.MiniVue = global.MiniVue || {}, global.MiniVue.es5 = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  /*
   * @Author: xiaoai
   * @Date: 2018-11-15 20:18:05
   * @LastEditors: xiaoai
   * @LastEditTime: 2018-11-16 11:57:20
   * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
   */
  var _console = window.console;
  function debug(type, msg) {
    _console[type].call(_console, msg);
  }

  /*
   * @Author: xiaoai
   * @Date: 2018-11-15 19:58:29
   * @LastEditors: xiaoai
   * @LastEditTime: 2018-12-06 19:34:55
   * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
   */
  var noop$1 = function noop(a, b, c) {};
  var callHook = function callHook(vm, hook) {
    var handlers = vm.$options[hook];

    if (handlers) {
      handlers.call(vm);
    }
  };
  var debug$1 = debug;

  /*
   * @Author: xiaoai
   * @Date: 2018-11-15 16:03:18
   * @LastEditors: xiaoai
   * @LastEditTime: 2018-11-16 11:59:29
   * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
   */
  var uid = 0;
  /**
   * 订阅者Dep
   * 主要作用是用来存放Watcher观察者对象
   */

  var Dep =
  /*#__PURE__*/
  function () {
    function Dep() {
      _classCallCheck(this, Dep);

      // 标示id防止添加重复观察者对象
      this.id = uid++; // 存储观察者对象

      this.subs = [];
    }
    /**
     * 添加观察者
     * @param {Watcher对象} sub
     */


    _createClass(Dep, [{
      key: "addSub",
      value: function addSub(sub) {
        this.subs.push(sub);
      }
      /**
       * 删除观察者
       * @param {Watcher对象} sub
       */

    }, {
      key: "removeSub",
      value: function removeSub(sub) {
        var _ref = [0, this.subs.length],
            i = _ref[0],
            len = _ref[1];

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

    }, {
      key: "depend",
      value: function depend() {
        if (Dep.target) {
          Dep.target.addDep(this);
        }
      }
      /**
       * 通知所有订阅者
       * update方法是挂载在Watcher原型对象上面的,方法内部会把需要的更新数据push到异步队列中,等到数据所有操作完成在进行视图更新
       */

    }, {
      key: "notify",
      value: function notify() {
        // 拷贝观察者对象
        var subs = this.subs.slice(); // 循环所有观察者进行更新操作

        subs.map(function (item) {
          item.update();
          return item;
        });
      }
    }]);

    return Dep;
  }(); // 依赖收集完需要将Dep.target设为null，防止后面重复添加依赖
  Dep.target = null;
  var targetStack = [];
  function pushTarget(_target) {
    if (Dep.target) {
      targetStack.push(Dep.target);
    }

    Dep.target = _target;
  }
  function popTarget() {
    Dep.target = targetStack.pop();
  }

  var sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: function get() {},
    set: function set() {}
  };
  function defineReactive(obj, key, val) {
    // 实例订阅者对象
    var dep = new Dep(); // 获取对象上面的描述

    var property = Object.getOwnPropertyDescriptor(obj, key);

    if (property && property.configurable === false) {
      return;
    }

    var getter = property && property.get;
    var setter = property && property.set;

    if ((!getter || setter) && arguments.length === 2) {
      val = obj[key];
    }

    var childObj = observe(val);
    Object.defineProperty(obj, key, {
      // 可枚举
      enumerable: true,
      configurable: true,
      get: function reactiveGetter() {
        var value = getter ? getter.call(obj) : val; // 依赖收集

        if (Dep.target) {
          dep.depend();
        }

        return value;
      },
      set: function reactiveSetter(newVal) {
        var value = getter ? getter.call(obj) : val;

        if (newVal === value || newVal !== newVal && value !== value) {
          return;
        } // 更新值


        if (setter) {
          setter.call(obj, newVal);
        } else {
          val = newVal;
        } // 新的值是object的话，进行监听


        childObj = observe(newVal); // 通知所有订阅者进行视图更新

        dep.notify();
      }
    });
  } // 把computed的属性挂载到minivue实例上

  function defineComputed(target, key, userDef) {
    if (typeof userDef === 'function') {
      sharedPropertyDefinition.get = createComputedGetter(key);

      sharedPropertyDefinition.set = function () {};
    }

    Object.defineProperty(target, key, sharedPropertyDefinition);
  }
  function createComputedGetter(key) {
    return function computedGetter() {
      var watcher = this._computedWatchers && this._computedWatchers[key];

      if (watcher) {
        // if (watcher.dirty) {
        watcher.get(); // }

        if (Dep.target) {
          watcher.depend();
        }

        return watcher.value;
      }
    };
  }

  var Observer =
  /*#__PURE__*/
  function () {
    function Observer(value) {
      _classCallCheck(this, Observer);

      this.value = value;
      this.dep = new Dep();
      this.walk(value);
    }
    /**
     * 给每个数据属性转为为getter/setter，在读取和设置的时候都会进入对应方法进行数据监听和更新
     * @param {Object} obj 监听对象
     */


    _createClass(Observer, [{
      key: "walk",
      value: function walk(obj) {
        var keys = Object.keys(obj);

        for (var i = 0; i < keys.length; i++) {
          defineReactive(obj, keys[i]);
        }
      }
    }]);

    return Observer;
  }();

  function observe(value, vm) {
    if (!value || _typeof(value) !== 'object') {
      return;
    }

    return new Observer(value);
  }

  /*
   * @Author: xiaoai
   * @Date: 2018-12-02 20:41:41
   * @LastEditors: xiaoai
   * @LastEditTime: 2018-12-07 00:41:24
   * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
   */
  var regExp = {
    // 匹配结束标签
    endTag: /^<\/((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)[^>]*>/,
    // 匹配开始打开标签
    startTagOpen: /^<((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)/,
    // 匹配开始结束标签
    startTagClose: /^\s*(\/?)>/,
    // 匹配属性
    attribute: /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/,
    // 匹配注释
    comment: /^<!\--/,
    // 匹配条件注释
    conditionalComment: /^<!\[/,
    // 匹配html类型 doctype
    doctype: /^<!DOCTYPE [^>]+>/i,
    // 匹配表达式 {{}}
    defaultTagRE: /\{\{((?:.|\n)+?)\}\}/g
  };

  var singleLabel = ['input', 'br', 'hr'];
  /**
   * 编译类
   */

  var Compiler =
  /*#__PURE__*/
  function () {
    function Compiler(vm, options) {
      _classCallCheck(this, Compiler);

      this.vm = vm;
      this.ast = {};
      this.$optins = options; // 获取需要编译的dom

      this.$el = document.querySelector(options.el); // render

      this.$el.outerHTML && this.compileToFunctions(this.$el.outerHTML);
    }
    /**
     * 将vue中dom编译成render函数
     * @param template String dom字符串
     */


    _createClass(Compiler, [{
      key: "compileToFunctions",
      value: function compileToFunctions(template) {
        this.template = template; // 会用正则等方式解析template模板中的指令、class、style等数据，形成AST

        this._convertHtml2Ast(); // 将AST转化成render字符串


        this.render = this._converCode(this.ast);
      }
      /**
       * 遍历dom字符串记录当前位置和删除已经遍历过的dom
       * @param {Number} n 当前dom字符串下标
       */

    }, {
      key: "_advance",
      value: function _advance(n) {
        this.index += n;
        this.template = this.template.substring(n);
      }
      /**
       * 处理开始标签
       */

    }, {
      key: "_parseStartTag",
      value: function _parseStartTag() {
        var start = this.template.match(regExp.startTagOpen);

        if (start) {
          var match = {
            tagName: start[1],
            attrs: [],
            start: this.index
          };

          this._advance(start[0].length);

          var end, attr;

          while (!(end = this.template.match(regExp.startTagClose)) && (attr = this.template.match(regExp.attribute))) {
            this._advance(attr[0].length);

            match.attrs.push(attr);
          } // 如果当前标签是否是以 > 结尾


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

    }, {
      key: "_parseEndTag",
      value: function _parseEndTag() {
        // 获取当前栈中最后一个元素
        var element = this.stack[this.stack.length - 1];
        var lastNode = element.children[element.children.length - 1]; // 如果是注释文本就删除

        if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
          element.children.pop();
        } // 出栈


        this.stack.length -= 1;
        this.currentParent = this.stack[this.stack.length - 1];
      }
      /**
       * 处理开始标签中的匹配到属性添加ast中
       * @param Object startTagMatch<{attrs:Array,tagName: String, start: Number, end: Number}>
       */

    }, {
      key: "_handleStartTag",
      value: function _handleStartTag(startTagMatch) {
        var attrs = []; // 当前标签是否是以 > 结尾的flag

        this.unary = !!startTagMatch.unarySlash;
        startTagMatch.attrs.map(function (item) {
          attrs.push({
            name: item[1],
            value: item[3] || item[4] || item[5] || ''
          });
        });

        var element = this._createASTElement(startTagMatch, attrs, this.currentParent); // 创建ast


        if (!this.ast) {
          this.ast = element;
        }

        if (this.currentParent) {
          this.currentParent.children.push(element);
          element.parent = this.currentParent;
        } // 如果不是结束 > 标签就添加到堆栈中和记录当前父级


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

    }, {
      key: "_createASTElement",
      value: function _createASTElement(startTagMatch, attrs, parent) {
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
            event[attrs[i].name.match(/\w*$/)[0]] = {
              value: attrs[i].value
            };
          } else if (class2styleReg.test(attrs[i].name)) {
            attrs[i].name.indexOf('class') > -1 ? staticClass = attrs[i].value : staticStyle = attrs[i].value;
          } else if (class2styleExpReg.test(attrs[i].name)) {
            attrs[i].name.indexOf(':class') > -1 ? classBinding = attrs[i].value : styleBinding = attrs[i].value;
          } else if (attrs[i].name === 'v-model') {
            isEvent = true;
            event['input'] = {
              value: "function($event){if($event.target.composing)return;".concat(attrs[i].value, "=$event.target.value}")
            };
            props.push({
              name: 'value',
              value: "(".concat(attrs[i].value, ")")
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
        } // 默认根ast数据结构


        var astMap = {
          type: 1,
          tag: startTagMatch.tagName,
          attrsList: attrs,
          attrsMap: map,
          parent: parent,
          children: []
        }; // 如果有事件绑定就添加到ast中

        if (isEvent) {
          astMap = Object.assign({}, astMap, {
            event: event
          }); // 处理v-model指令

          props.length && (astMap = Object.assign({}, astMap, {
            props: props,
            directives: directives
          }));
        } // 属性值


        if (_attrs.length) {
          astMap = Object.assign({}, astMap, {
            attrs: _attrs
          });
        } // 静态class


        if (staticClass) {
          astMap = Object.assign({}, astMap, {
            staticClass: staticClass
          });
        } // 静态样式


        if (staticStyle) {
          astMap = Object.assign({}, astMap, {
            staticStyle: staticStyle
          });
        } // 表达式样式


        if (styleBinding) {
          astMap = Object.assign({}, astMap, {
            styleBinding: styleBinding
          });
        } // 表达式class


        if (classBinding) {
          astMap = Object.assign({}, astMap, {
            classBinding: classBinding
          });
        }

        return astMap;
      }
      /**
       * 转换attrs
       * @param {Array} attrs
       * @returns Object
       */

    }, {
      key: "_makeAttrsMap",
      value: function _makeAttrsMap(attrs) {
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

    }, {
      key: "_chars",
      value: function _chars(text) {
        if (!this.currentParent) {
          return;
        }

        var children = this.currentParent.children;
        text = text.trim();

        if (text) {
          var res; // 文本节点并且是表达式

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

    }, {
      key: "_parseText",
      value: function _parseText(text) {
        if (!regExp.defaultTagRE.test(text)) {
          return;
        }

        var tokens = [];
        var rawTokens = [];
        var lastIndex = regExp.defaultTagRE.lastIndex = 0;
        var match, index, tokenValue;

        while (match = regExp.defaultTagRE.exec(text)) {
          index = match.index;

          if (index > lastIndex) {
            rawTokens.push(tokenValue = text.slice(lastIndex, index));
            tokens.push(JSON.stringify(tokenValue));
          } // 构造表达式


          var exp = match[1].trim();
          tokens.push('_s(' + exp + ')');
          rawTokens.push({
            '@binding': exp
          });
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          rawTokens.push(tokenValue = text.slice(lastIndex));
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

    }, {
      key: "_convertHtml2Ast",
      value: function _convertHtml2Ast() {
        this.ast = null;
        this.stack = [];
        this.index = 0;

        while (this.template) {
          var textEnd = this.template.indexOf('<');

          if (textEnd === 0) {
            // 如果是注释标签直接跳过编译
            if (regExp.comment.test(this.template)) {
              var commentEnd = this.template.indexOf('-->');

              this._advance(commentEnd + 3);

              continue;
            } // 匹配结束标签


            var endTagMatch = this.template.match(regExp.endTag);

            if (endTagMatch) {
              var _index = this.index;

              this._advance(endTagMatch[0].length);

              this._parseEndTag(endTagMatch[1], _index, this.index);

              continue;
            } // 匹配开始标签


            var startTagMatch = this._parseStartTag();

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

    }, {
      key: "_converCode",
      value: function _converCode(el) {
        var data = this._setGenCode(el);

        var children = this._getChildren(el); // 处理文本表达式


        if (!el.tag && el.type === 2) {
          return "_v(".concat(el.expression, ")");
        } // 处理文本


        if (!el.tag && el.type === 3) {
          return "_v(\"".concat(el.text, "\")");
        }

        return "_c('" + el.tag + "'" + (data ? ',' + data : '') + (children ? ',' + children : '') + ')';
      }
      /**
       * 生成code
       * @param {Object} el ast树
       */

    }, {
      key: "_setGenCode",
      value: function _setGenCode(el) {
        var data = '{';

        if (el.staticClass) {
          data += "staticClass:\"".concat(el.staticClass, "\",");
        }

        if (el.classBinding) {
          data += "class:".concat(el.classBinding, ",");
        }

        if (el.staticStyle) {
          data += "staticStyle:\"".concat(el.staticStyle, "\",");
        }

        if (el.styleBinding) {
          data += "style:".concat(el.styleBinding, ",");
        } // 处理属性


        if (el.attrs) {
          data += "attrs:{".concat(this._genProps(el.attrs), "},");
        } // 处理事件


        if (el.event) {
          data += "on:{".concat(this._genHandlers(el.event), "},");
        } // 处理指令


        if (el.directives) {
          data += "directives:".concat(this._genDirectives(el.directives), ",");
        } // 处理domProps


        if (el.props) {
          data += "domProps:{".concat(this._genProps(el.props, true), "},");
        }

        data = data.replace(/,$/, '') + '}'; // 如果没有属性就直接返回空

        if (/^\{\}$/.test(data)) {
          data = '';
        }

        return data;
      }
      /**
       * 处理属性字段
       * @param {Array} props 标签属性元素集合
       */

    }, {
      key: "_genProps",
      value: function _genProps(props, flag) {
        var res = '';

        for (var i = 0; i < props.length; i++) {
          var prop = props[i];
          {
            flag ? res += '"' + prop.name + '":' + prop.value + ',' : res += '"' + prop.name + '":"' + prop.value + '",';
          }
        }

        return res.slice(0, -1);
      }
      /**
       * 处理事件
       */

    }, {
      key: "_genHandlers",
      value: function _genHandlers(events) {
        var res = '';

        for (var name in events) {
          res += '"' + name + '":' + events[name].value + ',';
        }

        return res.slice(0, -1);
      }
      /**
       * 处理指令
       * @param {Array} directives 
       */

    }, {
      key: "_genDirectives",
      value: function _genDirectives(directives) {
        var _code = '[';
        directives.map(function (item, index) {
          _code += "{name:\"".concat(item.name, "\",rawName:\"").concat(item.rawName, "\",value:(").concat(item.value, "),expression:\"").concat(item.value, "\"}").concat(index === directives.length - 1 ? ']' : ',');
        });
        return _code;
      }
      /**
       * 处理子节点
       * @param {Object} el 当前节点的Ast树
       */

    }, {
      key: "_getChildren",
      value: function _getChildren(el) {
        var _this = this;

        var children = el.children;

        if (children && children.length) {
          return '[' + children.map(function (item) {
            return _this._converCode(item);
          }) + ']';
        }
      }
    }]);

    return Compiler;
  }();

  var uid$1 = 0;
  /**
   * 观察者 Watcher
   * 主要作用是进行依赖收集的观察者和更新视图
   * 当依赖收集的时候会调用Dep对象的addSub方法，在修改data中数据的时候会触发Dep对象的notify，通知所有Watcher对象去修改对应视图
   */

  var Watcher =
  /*#__PURE__*/
  function () {
    /**
     * @param {Object} vm  miniVue实例对象
     * @param {Function} expOrFn watch监听函数
     * @param {Function} cb 回调触发视图更新函数
     */
    function Watcher(vm, expOrFn) {
      var cb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : noop$1;

      _classCallCheck(this, Watcher);

      this.vm = vm; // 设置id防止重复添加

      this.id = uid$1++; // 保存监听函数为字符串,错误提示会使用

      this.expression = expOrFn.toString(); // 新的依赖项id集合

      this.newDepIds = new Set(); // 新的依赖项 临时值在依赖收集完成之后会马上清除

      this.newDeps = []; // 添加后的依赖项id集合

      this.depIds = new Set(); // 添加后的依赖项 依赖收集完成会从newDeps中取出值赋值给自己

      this.deps = []; // 回调触发视图更新函数

      this.cb = cb; // 获取当前watcher表达式

      if (typeof expOrFn === 'function') {
        this.getter = expOrFn;
      } else {
        debug$1('error', this.expression + 'Not a function');
      }
    }

    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        // 更新当前watcher赋值给Dep.target，并且添加到target栈
        pushTarget(this);
        var value = this.getter.call(this.vm, this.vm); // 将观察者实例从target栈中取出并设置给Dep.target

        popTarget(); // 清除依赖

        this.cleanupDeps();
        this.value = value;
        return value;
      }
      /**
       * 添加依赖
       * @param {Object} dep Dep实例对象
       */

    }, {
      key: "addDep",
      value: function addDep(dep) {
        var _id = dep.id; // 如果没有添加依赖项就进行添加

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

    }, {
      key: "cleanupDeps",
      value: function cleanupDeps() {
        /*移除所有观察者对象*/
        var i = this.deps.length;

        while (i--) {
          var dep = this.deps[i];

          if (!this.newDepIds.has(dep.id)) {
            dep.removeSub(this);
          }
        } // 清除所有依赖数据，把newDeps数据赋值给deps存储依赖


        var tmp = this.depIds;
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

    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;

        while (i--) {
          this.deps[i].depend();
        }
      }
      /**
       * 触发更新
       */

    }, {
      key: "update",
      value: function update() {
        this.run(); // queueWatcher(this);
      }
      /**
       * update函数会调该函数进行更新回调
       */

    }, {
      key: "run",
      value: function run() {
        var value = this.get();

        if (value !== this.value) {
          var oldValue = this.value;
          this.value = value;
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }]);

    return Watcher;
  }();

  /*
   * @Author: xiaoai
   * @Date: 2018-12-06 15:58:11
   * @LastEditors: xiaoai
   * @LastEditTime: 2018-12-06 17:01:38
   * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
   */
  // 代码来源:vue源码/vue-dev/src/platforms/web/runtime/node-ops.js
  function createElement(tagName, vnode) {
    var elm = document.createElement(tagName);

    if (tagName !== 'select') {
      return elm;
    } // false or null will remove the attribute but undefined will not


    if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
      elm.setAttribute('multiple', 'multiple');
    }

    return elm;
  } //   export function createElementNS (namespace, tagName) {
  //     return document.createElementNS(namespaceMap[namespace], tagName)
  //   }

  function createTextNode(text) {
    return document.createTextNode(text);
  }
  function createComment(text) {
    return document.createComment(text);
  }
  function insertBefore(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  }
  function removeChild(node, child) {
    node.removeChild(child);
  }
  function appendChild(node, child) {
    node.appendChild(child);
  }
  function parentNode(node) {
    return node.parentNode;
  }
  function nextSibling(node) {
    return node.nextSibling;
  }
  function tagName(node) {
    return node.tagName;
  }
  function setTextContent(node, text) {
    node.textContent = text;
  }
  function setStyleScope(node, scopeId) {
    node.setAttribute(scopeId, '');
  }
  var nodeOptions = {
    createElement: createElement,
    createTextNode: createTextNode,
    createComment: createComment,
    insertBefore: insertBefore,
    removeChild: removeChild,
    appendChild: appendChild,
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    setStyleScope: setStyleScope
  };

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


  var Element =
  /*#__PURE__*/
  function () {
    /**
     * @param {element对象} oldElem element元素
     * @param {Object} vnode vnode虚拟dom
     * @param {Object} prevVnode 更新上一次的虚拟dom
     * @param {element对象} parentElm 父元素ele对象
     */
    function Element(vm, oldElem, vnode, prevVnode, parentElm) {
      _classCallCheck(this, Element);

      this.vm = vm;

      if (prevVnode) {
        callHook(vm, 'beforeUpdate');
      }

      this.prevVnode = prevVnode ? prevVnode : {
        data: {}
      };
      this.createElement(vnode, parentElm, prevVnode);
      this.removeVnodes(oldElem);
    }
    /**
     * vue diff算法实现
     */


    _createClass(Element, [{
      key: "path",
      value: function path() {
        return true;
      }
      /**
       * 删除老元素
       * @param {element对象} oldElem 上一次的元素
       */

    }, {
      key: "removeVnodes",
      value: function removeVnodes(oldElem) {
        nodeOptions.removeChild(oldElem.parentNode, oldElem);
      }
      /**
       * 根据VNode创建真实dom元素
       * @param {Object} vnode VNode
       * @param {ele} parentElm 父元素
       */

    }, {
      key: "createElement",
      value: function createElement$$1(vnode, parentElm) {
        this.path(); // 没有父元素就直接默认body

        if (!parentElm) {
          parentElm = document.querySelector('body');
        }

        var data = vnode.data;
        var children = vnode.children;
        var tag = vnode.tag; // 有tag就创建一个标签，没有就当成文本节点创建

        if (tag) {
          vnode.elm = nodeOptions.createElement(tag, vnode);
        } else {
          vnode.elm = nodeOptions.createTextNode(vnode.text);
        } // 如果有子元素数据，递归创建子元素


        this.createChildren(vnode, children);

        if (data) {
          this.updateAttrs(this.prevVnode, vnode);
          this.updateClass(this.prevVnode, vnode);
          this.updateDOMListeners(this.prevVnode, vnode);
          this.updateStyle(this.prevVnode, vnode);
        } // 添加都对应父元素下面


        if (parentElm !== undefined || parentElm !== null) {
          nodeOptions.appendChild(parentElm, vnode.elm);
        }
      }
      /**
       * 递归创建孩子节点
       * @param {Object} vnode VNode
       * @param {Array} children 孩子VNode
       */

    }, {
      key: "createChildren",
      value: function createChildren(vnode, children) {
        if (Array.isArray(children)) {
          var _ref = [0, children.length],
              i = _ref[0],
              len = _ref[1];

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

    }, {
      key: "updateAttrs",
      value: function updateAttrs(oldVnode, vnode) {
        var elm = vnode.elm;
        var oldAttrs = oldVnode.data.attrs || {};
        var attrs = vnode.data.attrs || {}; // 整合attrs和domProps

        if (vnode.data.domProps) {
          attrs = Object.assign({}, attrs, vnode.data.domProps);
        }

        var cur, old;

        for (var key in attrs) {
          cur = attrs[key];
          old = oldAttrs[key]; //   if (old !== cur) {

          elm.setAttribute(key, cur); //   }
        }
      }
      /**
       * 更新元素class
       * @param oldVnode
       * @param vnode
       */

    }, {
      key: "updateClass",
      value: function updateClass(oldVnode, vnode) {
        var elm = vnode.elm;
        var oldStaticClass = oldVnode.data.staticClass || '';
        var staticClass = vnode.data.staticClass || '';
        var oldClass = oldVnode.data.class || '';

        var _class = vnode.data.class || '';

        if (staticClass || _class) {
          var _cls = [].concat(staticClass, _class);

          elm.setAttribute('class', _cls.join(' '));
        }
      }
      /**
       * 绑定元素事件
       * @param oldVnode
       * @param vnode
       */

    }, {
      key: "updateDOMListeners",
      value: function updateDOMListeners(oldVnode, vnode) {
        var on = vnode.data.on || {};
        var oldOn = oldVnode.data.on || {};
        var cur;

        for (var name in on) {
          cur = createFnInvoker(on[name]);
          vnode.elm.addEventListener(name, cur, false);
        }
      }
      /**
       * 更新元素样式
       * @param oldVnode
       * @param vnode
       */

    }, {
      key: "updateStyle",
      value: function updateStyle(oldVnode, vnode) {
        var elm = vnode.elm;
        var oldStaticStyle = oldVnode.data.staticStyle || '';
        var staticStyle = vnode.data.staticStyle || '';
        var oldStyle = oldVnode.data.style || {};

        var _style = vnode.data.style || {}; // 如果直接写在标签上面的style遍历属性添加到最新的dom上面


        var styleArray = staticStyle.split(';');

        if (styleArray && styleArray.length) {
          styleArray.map(function (item) {
            var _s = item.split(':');

            if (_s && _s.length) {
              elm.style[_s[0]] = _s[1];
            }
          });
        } // 添加样式


        for (var key in _style) {
          elm.style[key] = _style[key];
        }
      }
    }]);

    return Element;
  }();

  /*
   * @Author: xiaoai
   * @Date: 2018-12-04 19:53:19
   * @LastEditors: xiaoai
   * @LastEditTime: 2018-12-06 15:28:47
   * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
   */

  /**
   * 虚拟Dom基类
   */
  var VNode =
  /*#__PURE__*/
  function () {
    function VNode(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
      _classCallCheck(this, VNode);

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

    _createClass(VNode, [{
      key: "child",
      value: function child() {
        return this.componentInstance;
      }
    }]);

    return VNode;
  }();
  var createEmptyVNode = function createEmptyVNode() {
    var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var node = new VNode();
    node.text = text;
    node.isComment = true;
    return node;
  };
  /**
   * 创建文本节点
   */

  function createTextVNode(val) {
    return new VNode(undefined, undefined, undefined, String(val));
  }
  /**
   * 创建元素
   * @param {Object} context miniVue实例
   * @param {String} tag 标签
   * @param {Object} data 数据
   * @param {Array} children 子节点
   */

  function createElement$1(context, tag, data, children) {
    var vnode;

    if (!tag) {
      createEmptyVNode();
    } // 兼容不传data的情况, 处理<span>{{a}}</span>这种dom情况,字符串function为: _c('span', [_v(_s(a))])


    if (Array.isArray(data)) {
      children = data;
      data = undefined;
    }

    if (typeof tag === 'string') {
      vnode = new VNode(tag, data, children, undefined, undefined, context);
    }

    if (vnode !== undefined) {
      return vnode;
    }
  }

  var uid$2 = 0;
  /**
   * 主函数入口
   */

  var MiniVue =
  /*#__PURE__*/
  function () {
    function MiniVue(options) {
      _classCallCheck(this, MiniVue);

      if ((this instanceof MiniVue ? this.constructor : void 0) !== MiniVue) {
        throw new Error('必须使用 new 命令生成实例');
      }

      this.id = uid$2++;
      this._self = this;
      this.$options = options;
      this.init(options);
    }

    _createClass(MiniVue, [{
      key: "init",
      value: function init() {
        var vm = this;
        callHook(vm, 'beforeCreated'); // 创建元素

        this._c = function (a, b, c, d) {
          return createElement$1(vm, a, b, c, d);
        }; // 创建文本节点


        this._v = createTextVNode; // 序列化字符串 创建文本节点并且里面含有{{}}表达式，先处理表达式得到值，在进行字符串转换

        this._s = function (val) {
          return val.toString();
        }; // 初始化data数据，代理数据和数据劫持


        this._initData(); // 初始化computed


        this._initComputed(); // 初始化methods


        this._initMethod(); // 编译render，创建虚拟Dom


        this.mounted();
      }
      /**
       * 代理函数
       * 将data上面的属性代理到了vm实例上,这样就可以用app.text代替app._data.text了
       * @param {Object} target 代理目标对象
       * @param {String} sourceKey 代理key
       * @param {String} key 目标key
       */

    }, {
      key: "proxy",
      value: function proxy(target, sourceKey, key) {
        var vm = this;
        Object.defineProperty(target, key, {
          enumerable: true,
          configurable: true,
          get: function get() {
            return vm[sourceKey][key];
          },
          set: function set(val) {
            vm[sourceKey][key] = val;
          }
        });
      }
      /**
       * 初始化data对象数据,收集数据添加监听
       */

    }, {
      key: "_initData",
      value: function _initData() {
        var vm = this;
        var data = this.$options.data; // data支持两种写法(函数和对象)
        // 如果data是函数就直接执行拿到返回值,如果是对象直接返回

        data = vm._data = typeof data === 'function' ? data.call(vm) : data || {};
        var keys = Object.keys(data);
        var i = keys.length;

        while (i--) {
          var key = keys[i];
          this.proxy(vm, '_data', key);
        }

        observe(data, vm);
      }
      /**
       * 初始化methods方法挂载miniVue实例上
       */

    }, {
      key: "_initMethod",
      value: function _initMethod() {
        for (var key in this.$options.methods) {
          this[key] = this.$options.methods[key] == null ? noop : this.$options.methods[key].bind(this);
        }
      }
      /**
       * 初始化computed,添加依赖监听
       */

    }, {
      key: "_initComputed",
      value: function _initComputed() {
        var vm = this;

        var noop = function noop() {};

        var watchers = vm._computedWatchers = Object.create(null);

        if (this.$options.computed) {
          for (var key in this.$options.computed) {
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

    }, {
      key: "mounted",
      value: function mounted() {
        var vm = this;
        callHook(vm, 'created');

        if (this.$options.el) {
          callHook(vm, 'beforeMount'); // 编译template

          var compiler = new Compiler(vm, this.$options); // 将AST转化成render function字符串

          this.$options.render = new Function('with(this){return ' + compiler.render + '}');

          var updateComponent = function updateComponent() {
            var prevVnode = vm._vnode;
            var oldElem = document.querySelector(this.$options.el); // 根据render function字符串创建VNode虚拟Dom

            vm.vnode = vm.$options.render.call(vm);
            vm._vnode = vm.vnode; // 根据VNode创建真实dom元素

            new Element(vm, oldElem, vm.vnode, prevVnode, null);
          }; // 把渲染函数添加到wather里面，如果有数据更新就重新执行渲染函数进行页面更新


          new Watcher(vm, updateComponent, function () {}).get();
          callHook(vm, 'mounted');
        }
      }
    }]);

    return MiniVue;
  }();

  return MiniVue;

})));
