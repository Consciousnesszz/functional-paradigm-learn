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
 * 其表示了逻辑或（||），还体现了范畴学里 coproduct 的概念，
 * 也是标准的 sum type（或者叫不交并集，disjoint union of sets）
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
 * 4. 非纯操作 IO
 * 与 container 不同的地方：
 * __value（unsafePerformIO） 始终是一个函数。通过层层传递，将非纯操作交给调用方，保持 IO 本身的纯净
 */
var IO = function (f) {
  this.unsafePerformIO = f;
}

IO.of = function (x) {
  return new IO(function () {
    return x;
  });
}

IO.prototype.map = function (f) {
  return new IO(_.compose(f, this.unsafePerformIO));
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

// 调用 unsafePerformIO() 来运行
findParam("searchTerm").unsafePerformIO();
// Maybe(['searchTerm', 'wafflehouse'])

/** ======================================================
 * 5. 异步任务 Task
 * 与 IO 类似，单在参数中加入了 reject 和 resolve，可类比 Promise
 */

var Task = function (f) {
  this.fork = f;
}

Task.of = function (x) {
  return new Task(function () {
    return x;
  });
}

Task.prototype.map = function (f) {
  return new Task(_.compose(f, this.fork));
}

//  getJSON :: String -> {} -> Task(Error, JSON)
var getJSON = curry(function (url, params) {
  return new Task(function (reject, resolve) {
    $.getJSON(url, params, resolve).fail(reject);
  });
});

getJSON('/video', { id: 10 }).map(_.prop('title'));
// Task("Family Matters ep 15")

// 传入普通的实际值也没问题
Task.of(3).map(function (three) { return three + 1 });
// Task(4)

/**
 * 练习
 */
require('../../support');
var Task = require('data.task');
var _ = require('ramda');

// 练习 1
// ==========
// 使用 _.add(x,y) 和 _.map(f,x) 创建一个能让 functor 里的值增加的函数

var ex1 = _.map(_.add(1));



//练习 2
// ==========
// 使用 _.head 获取列表的第一个元素
var xs = Identity.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'ti', 'do']);

var ex2 = Identity.map(_.head);



// 练习 3
// ==========
// 使用 safeProp 和 _.head 找到 user 的名字的首字母
var safeProp = _.curry(function (x, o) { return Maybe.of(o[x]); });

var user = { id: 2, name: "Albert" };

var ex3 = _.head(safeProp('name', user));


// 练习 4
// ==========
// 使用 Maybe 重写 ex4，不要有 if 语句

var ex4 = function (n) {
  if (n) { return parseInt(n); }
};

var ex4 = Maybe.map(parseInt);



// 练习 5
// ==========
// 写一个函数，先 getPost 获取一篇文章，然后 toUpperCase 让这片文章标题变为大写

// getPost :: Int -> Future({id: Int, title: String})
var getPost = function (i) {
  return new Task(function (rej, res) {
    setTimeout(function () {
      res({ id: i, title: 'Love them futures' })
    }, 300)
  });
}

var ex5 = getPost(1).map(_.compose(_.prop('title'), toUpperCase));



// 练习 6
// ==========
// 写一个函数，使用 checkActive() 和 showWelcome() 分别允许访问或返回错误

var showWelcome = _.compose(_.add("Welcome "), _.prop('name'))

var checkActive = function (user) {
  return user.active ? Right.of(user) : Left.of('Your account is not active')
}

var either = curry(function (f, g, e) {
  switch (e.constructor) {
    case Left: return f(e.__value);
    case Right: return g(e.__value);
  }
});
var ex6 = _.compose(either(id, showWelcome), checkActive)



// 练习 7
// ==========
// 写一个验证函数，检查参数是否 length > 3。如果是就返回 Right(x)，否则就返回
// Left("You need > 3")

var ex7 = function (x) {
  return (
    x.length > 3 ?
      Right.of(x) :
      Left.of("You need > 3")
  )
}



// 练习 8
// ==========
// 使用练习 7 的 ex7 和 Either 构造一个 functor，如果一个 user 合法就保存它，否则
// 返回错误消息。别忘了 either 的两个参数必须返回同一类型的数据。

var save = function (x) {
  return new IO(function () {
    console.log("SAVED USER!");
    return x + '-saved';
  });
}

var ex8 = _.compose(either(id, save), ex7)
