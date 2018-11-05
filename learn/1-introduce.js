/**
 * 函数式介绍
 */

// 面向对象例子
var Flock = function (n) {
  this.seagulls = n;
};

Flock.prototype.conjoin = function (other) {
  this.seagulls += other.seagulls;
  return this;
};

Flock.prototype.breed = function (other) {
  this.seagulls = this.seagulls * other.seagulls;
  return this;
};

var flock_a = new Flock(4);
var flock_b = new Flock(2);
var flock_c = new Flock(0);

var result = flock_a.conjoin(flock_c).breed(flock_b).conjoin(flock_a.breed(flock_b)).seagulls;
//=> 32 （正确答案16）

/**
 * 面向对象弊端
 * 1. 状态值极易改变，输入和输出不可预测
 * 2. 语法繁琐，需要及其多的命名
 */

// 函数式改写
var multiply = (a, b) => a * b
var add = (a, b) => a + b
var result = add(multiply(add(flock_a, flock_c), flock_b), multiply(flock_a, flock_b))
// result = multiply(flock_b, add(flock_a, flock_a)) ===> 16
