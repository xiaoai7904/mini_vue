/*
 * @Author: xiaoai
 * @Date: 2018-11-15 20:18:05
 * @LastEditors: xiaoai
 * @LastEditTime: 2018-11-16 11:57:20
 * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
 */
let _console = window.console

export default function debug(type, msg) {
    _console[type].call(_console, msg)
}
