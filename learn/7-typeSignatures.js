/**
 * 函数签名
 * 查询类型签名的网站：https://www.haskell.org/hoogle
 */

/**
 * 明确的类型签名
 */
//  capitalize :: String -> String
var capitalize = function (s) {
  return toUpperCase(head(s)) + toLowerCase(tail(s));
}

//  strLength :: String -> Number
var strLength = function (s) {
  return s.length;
}

//  join :: String -> [String] -> String  ======》 [String] 代表成员为字符串的数组，curry 函数可分段展示类型签名
var join = curry(function (what, xs) {
  return xs.join(what);
});

//  match :: Regex -> String -> [String]
var match = curry(function (reg, s) {
  return s.match(reg);
});

//  replace :: Regex -> String -> String -> String
var replace = curry(function (reg, sub, s) {
  return s.replace(reg, sub);
});

/**
 * 抽象的类型签名
 */
//  id :: a -> a
var id = function (x) { return x; }

//  map :: (a -> b) -> [a] -> [b]    ======》 (a -> b) 代表函数输入 a 类型，返回与 a 不同的 b 类型
var map = curry(function (f, xs) {
  return xs.map(f);
});

// sort :: Ord a => [a] -> [a]
// assertEqual :: (Eq a, Show a) => a -> a -> Assertion
// 签名可以规定 a 的类型

/**
 * 抽象类型签名的优点
 * 1. 确定了函数行为就可以缩小函数可能性范围
 * 2. 自由定理，同一个签名表现可以有不同的组合（compose）
 * 3. 类型约束，签名可以把类型约束为一个特定的接口
 */
