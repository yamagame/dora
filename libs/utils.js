const timeout = ms => new Promise(res => setTimeout(res, ms))

const generateId = () => (1+Math.random()*4294967295).toString(16)

var mustache = require("mustache");

const _isNumeric = /^[-+]?[123456789](\d*|\d*\.\d*|\d*\.\d+)$/;

const isNumeric = function(v) {
  return _isNumeric.test(v) || v === '0';
}

const randInteger = function(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

module.exports = {
  timeout,
  generateId,
  mustache,
  isNumeric,
  randInteger,
}
