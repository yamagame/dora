async function request(command, options, params) {
  if (arguments.length <= 0) {
    throw new Error('Illegal arguments.');
  }
  const opt = {
    method: 'POST',
    restype: 'json',
  }
  if (arguments.length == 1) {
    params = command;
    command = 'command';
  }
  if (arguments.length == 2) {
    params = options;
  }
  if (options) {
    if (options.method) opt.method = options.method;
    if (options.restype) opt.restype = options.restype;
  }
  let response = await fetch(`/${command}`, {
    method: opt.method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  })
  if (opt.restype === 'text') {
    return await response.text();
  }
  return await response.json();
}

const timeout = ms => new Promise(res => setTimeout(res, ms))

const generateId = () => (1+Math.random()*4294967295).toString(16)

var mustache = require("mustache");

module.exports = {
  timeout,
  generateId,
  request,
  mustache,
}
