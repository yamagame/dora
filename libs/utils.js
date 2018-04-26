const timeout = ms => new Promise(res => setTimeout(res, ms))

const generateId = () => (1+Math.random()*4294967295).toString(16)

var mustache = require("mustache");

module.exports = {
  timeout,
  generateId,
  mustache,
}
