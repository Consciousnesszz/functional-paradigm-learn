/**
 * Y 合子 推导过程
 * 原文：https://zhuanlan.zhihu.com/p/20616683
 */

/**
 * 命令式实现递归
 */
function fibonacci(n) {
  if (n === 1 || n === 2) {
    return 1
  } else {
    return fibonacci(n - 1) + fibonacci(n - 2)
  }
}

/**
 * 将命令式转化为函数式
 * 要点：
 * 1. 函数式不能使用命名函数，如何进行递归
 * 2. 如何提取通用 Y 合子，而不是每一个递归写一个合子
 */

// 第一步：简化旧函数
const fibonacciBeauty = n => [1, 2].indexOf(n) > -1 ? 1 : fibonacciBeauty(n - 1) + fibonacciBeauty(n - 2)

/**
 * 解决问题1：命名的目的是为了保存函数的引用。因此函数式可以采用闭包方式保存，达到同样目的。
 */
// 闭包保存引用
const firstStep = (fn, n) => [1, 2].indexOf(n) > -1 ? 1 : fn(fn, (n - 1)) + fn(fn, (n - 2))
firstStep(firstStep, 5) // 调用时传入自身

// 更加函数式：每次只接收一个参数
const secondStep = fn => n => [1, 2].indexOf(n) > -1 ? 1 : fn(fn)(n - 1) + fn(fn)(n - 2)
secondStep(secondStep)(5)

// 取消最后的命名
(fn => n => [1, 2].indexOf(n) > -1 ? 1 : fn(fn)(n - 1) + fn(fn)(n - 2))(fn => n => [1, 2].indexOf(n) > -1 ? 1 : fn(fn)(n - 1) + fn(fn)(n - 2))(5)

/**
 * 以上代码可以运行，且看起来很‘函数式’。但它并不通用，需要对每一个递归进行一次推导。这叫做‘穷人的 Y 合子’。
 * 所以接下来解决问题2：寻找规律，将通用 Y 合子 抽象 出来。
 * 观察发现，fn(fn), name(name) 这种模式出现 3 次，根据 DRY 原则，可将其抽出。
 */
// 抽出 name(name)
const w = f => f(f)
w(fn => n => [1, 2].indexOf(n) > -1 ? 1 : fn(fn)(n - 1) + fn(fn)(n - 2))(5)

// 抽出 fn(fn)
w(fn => (g => n => [1, 2].indexOf(n) > -1 ? 1 : g(n - 1) + g(n - 2))(fn(fn)))(5)

// 解决按值传递 f(f) 栈溢出问题
w(fn => (
    // 斐波那契数列定义
    g => n => [1, 2].indexOf(n) > -1 ? 1 : g(n - 1) + g(n - 2)
  )(v => fn(fn)(v))
)(5)

// 将定义提取出来，作为参数
w(
  (fibo => fn => fibo(v => fn(fn)(v)))
  (g => n => [1, 2].indexOf(n) > -1 ? 1 : g(n - 1) + g(n - 2))
)(5)

// 将斐波那契数列定义再次提出一个层级
(
  h =>
    w(
      (fibo => fn => fibo(v => fn(fn)(v)))
      (h)
    )
)(g => n => [1, 2].indexOf(n) > -1 ? 1 : g(n - 1) + g(n - 2))(5)

// 将 fibo 带入为 h 以化简
(
  h =>
    w(
      fn => h(v => fn(fn)(v))
    )
)(g => n => [1, 2].indexOf(n) > -1 ? 1 : g(n - 1) + g(n - 2))(5)

// 去掉 w
(
  h =>
    (f => f(f))(fn => h(v => fn(fn)(v)))
)(g => n => [1, 2].indexOf(n) > -1 ? 1 : g(n - 1) + g(n - 2))(5)

// 得到一般化的 Y 合子
h => (f => f(f))(fn => h(v => fn(fn)(v)))
// 或
h => (fn => h(v => fn(fn)(v)))(fn => h(v => fn(fn)(v)))

/**
 * 证明 (Y F) = (F (Y F)) , Y(f)确实是函数 f 的不动点
 *
 * 左边：
 * (Y F)
 * (fn => F(v => fn(fn)(v)))(fn => F(v => fn(fn)(v))
 * 令 x = fn => F(v => fn(fn)(v)
 * 则 F(v => x(x)(v))
 * 消去 v 函数，即 F(x(x))
 * 将 x 代回 F(fn => F(v => fn(fn)(v))(fn => F(v => fn(fn)(v))
 *
 * 右边：
 * F (Y F)
 * F (fn => F(v => fn(fn)(v)))(fn => F(v => fn(fn)(v))
 */

// 使用 Y 合子，以阶乘为例
(
  h => (fn => h(v => fn(fn)(v)))(fn => h(v => fn(fn)(v))) // 传入 Y 合子
)(
  g => n => n === 1 ? n : n * g(n - 1) // 传入递归定义
)(5) // 传入初始值
