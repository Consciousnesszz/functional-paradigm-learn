/**
 * 一等公民的函数 ==> 函数作为值传递会发生什么
 */

// 没意识到函数可以作为参数传递的例子
// 1
var hi = function (name) {
  return "Hi " + name;
};

var greeting = function (name) {
  return hi(name);
};

// 2
var getServerStuff = function (callback) {
  return ajaxCall(function (json) {
    return callback(json);
  });
};

// 3
var BlogController = (function () {
  var index = function (posts) {
    return Views.index(posts);
  };

  var show = function (post) {
    return Views.show(post);
  };

  var create = function (attrs) {
    return Db.create(attrs);
  };

  var update = function (post, attrs) {
    return Db.update(post, attrs);
  };

  var destroy = function (post) {
    return Db.destroy(post);
  };

  return { index: index, show: show, create: create, update: update, destroy: destroy };
})();

// 将函数作为参数传递
// 1
var greeting = hi

// 2
var getServerStuff = ajaxCall

// 3
var BlogController = { index: View.index, show: View.show, create: Db.create, update: Db.update, destroy: Db.destroy }

/**
 * 为何要强调将函数作为参数的形式
 * 1. 逻辑清晰
 * 2. 当原函数发生改动——如添加一个参数，包裹其的胶水函数也需要改动
 *
 * 为函数命名注意点
 * 1. 取通用名字，提高复用
 *
 * 函数作为参数的注意点
 * 1. this 指向，最好 bind 一次
 */
