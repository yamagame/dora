const fs = require('fs');
const Dora = require('../index');
const dora = new Dora();

const script = fs.readFileSync('./samples/test1.dora');

const io = require('socket.io-client');
const socket = io('http://localhost:3090');

dora.parse(script.toString(), (filename, callback) => {
  const script = fs.readFileSync(filename);
  callback(script.toString());
});

dora.request = async function(command, options, params) {
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

socket.on('connect', () => {
  console.log('connected');
  dora.play({}, {
    range: {
      start: 0,
    },
    socket,
  }, (err, msg) => {
    console.log(msg);
  });
});
