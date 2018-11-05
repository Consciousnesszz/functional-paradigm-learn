/**
 * 代码组合
 */

// 组合函数
var compose = function (f, g) {
  return function (x) {
    return f(g(x));
  };
};

// 使用
var toUpperCase = x => x.toUpperCase()
var exclaim = x => x + '!'
var shout = compose(exclaim, toUpperCase);

/**
 * 组合的用处
 * 1. 数据从右向左流动，过程清晰可追踪，区别于嵌套调用，提高可读性
 * 2. 将两个函数组合在一起而不需要考虑其中的细节
 * 3. pointfree，减少不必要的命名，让代码保持简洁和通用
 * 4. 无副作用，可适用数学定理对函数进行简化和推导
 */

/**
 * pointfree：无需指出中间参数名
 */
// 非 pointfree，因为提到了数据：word
var snakeCase = function (word) {
  return word.toLowerCase().replace(/\s+/ig, '_');
};

// pointfree
var snakeCase = compose(replace(/\s+/ig, '_'), toLowerCase);

/**
 * compose 常见错误：传入参数类型错误
 */
// 错误做法：我们传给了 `angry` 一个数组，根本不知道最后传给 `map` 的是什么东西。
var latin = compose(map, angry, reverse);

latin(["frog", "eyes"]); // error

// 正确做法：每个函数都接受一个实际参数。
var latin = compose(map(angry), reverse);

latin(["frog", "eyes"]); // ["EYES!", "FROG!"])

/**
 * 对 compose 函数 debug
 */
// 工具函数 trace
var trace = curry(function (tag, x) {
  console.log(tag, x);
  return x;
});

// 产生错误的函数
var dasherize = compose(join('-'), toLower, split(' '), replace(/\s{2,}/ig, ' '));

// 使用 trace ===> 传入 toLower 的是一个数组
var dasherize = compose(join('-'), toLower, trace("after split"), split(' '), replace(/\s{2,}/ig, ' '));
// after split [ 'The', 'world', 'is', 'a', 'vampire' ]

// 修复 bug
var dasherize = compose(join('-'), map(toLower), split(' '), replace(/\s{2,}/ig, ' '));

/**
 * compose 适用的一些数学定理
 *
 * 1. 结合律： compose(f, compose(h, g)) === compose(compose(f, h), g)
 * 2. 范畴学的态射
 * 3. 单位律：
 *    var id = x => x
 *    compose(id, f) === compose(f, id) === f
 */

// 练习
require('../../support');
var _ = require('ramda');
var accounting = require('accounting');

// 示例数据
var CARS = [
  { name: "Ferrari FF", horsepower: 660, dollar_value: 700000, in_stock: true },
  { name: "Spyker C12 Zagato", horsepower: 650, dollar_value: 648000, in_stock: false },
  { name: "Jaguar XKR-S", horsepower: 550, dollar_value: 132000, in_stock: false },
  { name: "Audi R8", horsepower: 525, dollar_value: 114200, in_stock: false },
  { name: "Aston Martin One-77", horsepower: 750, dollar_value: 1850000, in_stock: true },
  { name: "Pagani Huayra", horsepower: 700, dollar_value: 1300000, in_stock: false }
];

// 练习 1:
// ============
// 使用 _.compose() 重写下面这个函数。提示：_.prop() 是 curry 函数
var isLastInStock = function (cars) {
  var last_car = _.last(cars);
  return _.prop('in_stock', last_car);
};

var composeIsLastInStock = _.compose(_.prop('in_stock'), _.last)

// 练习 2:
// ============
// 使用 _.compose()、_.prop() 和 _.head() 获取第一个 car 的 name
var nameOfFirstCar = _.compose(_.prop('name'), _.head);


// 练习 3:
// ============
// 使用帮助函数 _average 重构 averageDollarValue 使之成为一个组合
var _average = function (xs) { return reduce(add, 0, xs) / xs.length; }; // <- 无须改动

var averageDollarValue = function (cars) {
  var dollar_values = map(function (c) { return c.dollar_value; }, cars);
  return _average(dollar_values);
};

var composeAverageDollarValue = _.compose(_average, _.map(_.prop('dollar_value')))


// 练习 4:
// ============
// 使用 compose 写一个 sanitizeNames() 函数，返回一个下划线连接的小写字符串：例如：sanitizeNames(["Hello World"]) //=> ["hello_world"]。

var _underscore = replace(/\W+/g, '_'); //<-- 无须改动，并在 sanitizeNames 中使用它

var sanitizeNames = _.map(_.compose(_underscore, toLower));


// 彩蛋 1:
// ============
// 使用 compose 重构 availablePrices

var availablePrices = function (cars) {
  var available_cars = _.filter(_.prop('in_stock'), cars);
  return available_cars.map(function (x) {
    return accounting.formatMoney(x.dollar_value);
  }).join(', ');
};

var composeAvailablePrices = _.compose(
  _.join(', '),
  _.compose(
    _.map(
      _.compose(
        accounting.formatMoney,
        _.prop('dollar_value')
      )
    ),
    _.filter(_.prop('in_stock'))
  )
)


// 彩蛋 2:
// ============
// 重构使之成为 pointfree 函数。提示：可以使用 _.flip()

var fastestCar = function (cars) {
  var sorted = _.sortBy(function (car) { return car.horsepower }, cars);
  var fastest = _.last(sorted);
  return fastest.name + ' is the fastest';
};

var composeFastestCar = _.compose(
  _.compose(
    _.flip(_.concat)(' is the fastest'), // 颠倒参数顺序
    _.prop('name')
  ),
  _.compose(_.last, _.sortBy(_.prop('horsepower')))
)
