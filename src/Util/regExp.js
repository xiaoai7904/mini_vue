/*
 * @Author: xiaoai
 * @Date: 2018-12-02 20:41:41
 * @LastEditors: xiaoai
 * @LastEditTime: 2018-12-07 00:41:24
 * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
 */
export const regExp = {
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
