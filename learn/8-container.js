/**
 * 容器
 * 通过设计容器，将不可控的控制流、异步操作、异常处理等等包裹起来，以同步代码方式处理。
 * 这种类型又叫 functor，是实现了 map 函数并遵守一些特定规则的容器类型。
 */

/**
 * 1. 普通容器 Container
 */
var Container = function (x) {
  this.__value = x;
}

Container.of = function (x) { return new Container(x); };

// (a -> b) -> Container a -> Container b
Container.prototype.map = function (f) {
  return Container.of(f(this.__value))
}

// 使用
Container.of(3) //=> Container(3)

Container.of(2).map(function (two) { return two + 2 }) //=> Container(4)

/**
 * 2. 优化的容器 Maybe（添加错误处理机制，每次调用 map 都会先检查）
 */
var Maybe = function (x) {
  this.__value = x;
}

Maybe.of = function (x) {
  return new Maybe(x);
}

Maybe.prototype.isNothing = function () {
  return (this.__value === null || this.__value === undefined);
}

Maybe.prototype.map = function (f) {
  return this.isNothing() ? Maybe.of(null) : Maybe.of(f(this.__value));
}

// 使用（常用在那些可能会无法成功返回结果的函数中）
var safeHead = function (xs) {
  return Maybe.of(xs[0]);
};

var streetName = compose(map(_.prop('street')), safeHead, _.prop('addresses'));

streetName({ addresses: [] }); //=> Maybe(null)

streetName({ addresses: [{ street: "Shady Ln.", number: 4201 }] }); //=> Maybe("Shady Ln.")

// 运用帮助函数释放容器中的值
var maybe = curry(function (x, f, m) {
  return m.isNothing() ? x : f(m.__value);
});

// withdraw ::  Number -> Account -> Maybe(Account)
var withdraw = curry(function (amount, account) {
  return account.balance >= amount ?
    Maybe.of({ balance: account.balance - amount }) :
    Maybe.of(null);
});

//  getTwenty :: Account -> String
var getTwenty = compose(
  maybe("You're broke!", finishTransaction), withdraw(20)
);

getTwenty({ balance: 200.00 }); //=> "Your balance is $180.00"

getTwenty({ balance: 10.00 });  //=> "You're broke!"
