/**
 * 纯函数的好处
 *
 * 纯函数是这样一种函数，即相同的输入，永远会得到相同的输出，而且没有任何可观察的副作用。
 */

// slice 和 splice ====> slice 不会改变原函数，而 splice 则会在原函数上动手，打破了纯的定义
var xs = [1, 2, 3, 4, 5];

// 纯的
xs.slice(0, 3);
//=> [1,2,3]

xs.slice(0, 3);
//=> [1,2,3]

xs.slice(0, 3);
//=> [1,2,3]


// 不纯的
xs.splice(0, 3);
//=> [1,2,3]

xs.splice(0, 3);
//=> [4,5]

xs.splice(0, 3);
//=> []