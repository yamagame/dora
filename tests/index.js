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
