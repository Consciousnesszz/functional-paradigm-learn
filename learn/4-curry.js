/**
 * 函数柯里化（curry）
 *
 * curry 的概念：只传递给函数一部分参数来调用它，让它返回一个函数去处理剩下的参数。
 */

// 简单的柯里化
var add = a => b => a + b
var increment = add(1) // b => 1 + b
increment(2) // 3

// lodash curry（尽量把要操作的值作为最后一个参数，这样我们可以将缓存的函数进行拼接，最后一次性处理参数）
var curry = require('lodash').curry;

var match = curry(function (what, str) {
  return str.match(what);
});

var replace = curry(function (what, replacement, str) {
  return str.replace(what, replacement);
});

var filter = curry(function (f, ary) {
  return ary.filter(f);
});

var map = curry(function (f, ary) {
  return ary.map(f);
});

/**
 * 柯里化的优点
 * 1. 只传给函数一部分参数通常也叫做局部调用（partial application），能够大量减少样板文件代码（boilerplate code）
 * 2. 可以不用定义直接操作数组的函数，因为只需内联调用 map(getChildren) 就能达到目的。
 *    这一点同样适用于 sort、filter 以及其他的高阶函数（higher order function）（高阶函数：参数或返回值为函数的函数）。
 * 3. 保持了函数的纯，也允许一次性传入多个参数
 */

// 练习
var _ = require('ramda');

// 练习 1
//==============
// 通过局部调用（partial apply）移除所有参数

var words = function (str) {
  return split(' ', str);
};

var curryWords = _.curry((identifier, str) => split(identifier, str))

// 练习 1a
//==============
// 使用 `map` 创建一个新的 `words` 函数，使之能够操作字符串数组

var map = _.curry((f, arr) => arr.map(f))
var sentences = map(curryWords);

// 练习 2
//==============
// 通过局部调用（partial apply）移除所有参数

var filterQs = function (xs) {
  return filter(function (x) { return match(/q/i, x); }, xs);
};

var filter = _.curry((f, arr) => arr.filter(f))
var match = _curry((what, str) => str.match(what))
var matchQ = match(/q/i)
var curryFilterQs = filter(matchQ)

// 练习 3
//==============
// 使用帮助函数 `_keepHighest` 重构 `max` 使之成为 curry 函数

// 无须改动:
var _keepHighest = function (x, y) { return x >= y ? x : y; };

// 重构这段代码:
var max = function (xs) {
  return reduce(function (acc, x) {
    return _keepHighest(acc, x);
  }, -Infinity, xs);
};

var reduce = _.curry((f, start, xs) => reduce(f, start, xs))
var reduceHighest = reduce(_keepHighest)
var curryMax = reduceHighest(-Infinity)

// 彩蛋 1:
// ============
// 包裹数组的 `slice` 函数使之成为 curry 函数
// //[1,2,3].slice(0, 2)
var slice = _.curry((start, n, arr) => arr.slice(start, n));

// 彩蛋 2:
// ============
// 借助 `slice` 定义一个 `take` curry 函数，该函数调用后可以取出字符串的前 n 个字符。
var substr = _.curry((start, n, str) => str.substr(start, n))
var take = substr(0);
