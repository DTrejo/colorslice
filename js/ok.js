var a = require('assert')
require('./lib/jquery-1.9.0.min.js')
module.exports = ok

//
// asserts a jquery element is truthy
// or asserts that a javascript value is truthy
// returns the value on success
//
function ok(el) {
  // var args = Array.prototype.slice.call(arguments);
  // for (var i = 0, len = args.length; i < len; i++) {
    if (el instanceof $) {
      a.ok(el[0])
    } else {
      a.ok(el, el + '')
    }
  // }
  return el
};
