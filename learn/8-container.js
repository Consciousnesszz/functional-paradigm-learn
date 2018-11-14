/**
 * 容器
 * 通过设计容器，将不可控的控制流、异步操作、异常处理等等包裹起来，以同步代码方式处理。
 */

/** ======================================================
 * 1. 普通容器 Container
 * 体现了数学中的 functor 定义，是实现了 map 函数并遵守一些特定规则的容器类型。
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

/** ======================================================
 * 2. 优化的容器 Maybe（添加空值检查机制，每次调用 map 都会先检查）
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

/** ======================================================
 * 3. 错误处理 Either（可截断数据流，打印错误信息）
 * 其表示了逻辑或（||），还体现了范畴学里 coproduct 的概念，也是标准的 sum type（或者叫不交并集，disjoint union of sets）
 */

// 短路机制 left
var Left = function (x) {
  this.__value = x;
}

Left.of = function (x) {
  return new Left(x);
}

Left.prototype.map = function (f) {
  return this;
}

// 正常流程 right
var Right = function (x) {
  this.__value = x;
}

Right.of = function (x) {
  return new Right(x);
}

Right.prototype.map = function (f) {
  return Right.of(f(this.__value));
}

// 用例
var moment = require('moment');

//  getAge :: Date -> User -> Either(String, Number)
var getAge = curry(function (now, user) {
  var birthdate = moment(user.birthdate, 'YYYY-MM-DD');
  if (!birthdate.isValid()) return Left.of("Birth date could not be parsed");
  return Right.of(now.diff(birthdate, 'years'));
});

getAge(moment(), { birthdate: '2005-12-12' });  //=> Right(9)

getAge(moment(), { birthdate: 'balloons!' });  //=> Left("Birth date could not be parsed")

// 对应 maybe 的 either（进行错误信息打印）
// either :: (a -> c) -> (b -> c) -> Either a b -> c
var either = curry(function (f, g, e) {
  switch (e.constructor) {
    case Left: return f(e.__value);
    case Right: return g(e.__value);
  }
});

//  zoltar :: User -> _  （ _ 代表可省略的值）
var zoltar = compose(console.log, either(id, fortune), getAge(moment()));

zoltar({ birthdate: '2005-12-12' });
// "If you survive, you will be 10"
// undefined

zoltar({ birthdate: 'balloons!' });
// "Birth date could not be parsed"
// undefined


/** ======================================================
 * 4. 数据 IO
 * 与 container 不同的地方：
 * __value 始终是一个函数。通过层层传递，将非纯操作交给调用方，保持 IO 本身的纯净
 */
var IO = function (f) {
  this.__value = f;
}

IO.of = function (x) {
  return new IO(function () {
    return x;
  });
}

IO.prototype.map = function (f) {
  return new IO(_.compose(f, this.__value));
}

// 调用
//  io_window_ :: IO Window
var io_window = new IO(function () { return window; });

io_window.map(function (win) { return win.innerWidth });  //=> IO(1430)

io_window.map(_.prop('location')).map(_.prop('href')).map(split('/'));
// IO(["http:", "", "localhost:8000", "blog", "posts"])


// 传递非纯操作的用例
////// 纯代码库: lib/params.js ///////

//  url :: IO String
var url = new IO(function () { return window.location.href; });

//  toPairs =  String -> [[String]]
var toPairs = compose(map(split('=')), split('&'));

//  params :: String -> [[String]]
var params = compose(toPairs, last, split('?'));

//  findParam :: String -> IO Maybe [String]
var findParam = function (key) {
  return map(compose(Maybe.of, filter(compose(eq(key), head)), params), url);
};

////// 非纯调用代码: main.js ///////

// 调用 __value() 来运行它！
findParam("searchTerm").__value();
// Maybe(['searchTerm', 'wafflehouse'])
