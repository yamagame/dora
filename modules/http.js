const utils = require('../libs/utils');
const fetch = require('node-fetch');

module.exports = function(DORA, config) {

  /*
   *
   *
   */
  function POSTRequest(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      let message = options;
      if (isTemplated) {
        message = utils.mustache.render(message, msg);
      }
      var headers = {};
      var body = msg.payload;
      if (typeof msg.payload === 'object') {
        body = JSON.stringify(msg.payload);
        JSON.parse(body);
        headers['Content-Type'] = 'application/json';
      }
      try {
        let response = await fetch(`${message}`, {
          method: 'POST',
          headers,
          body,
          timeout: ('httpTimeout' in msg)?msg.httpTimeout:3000,
        })
        if (response.ok) {
          const data = await response.text();
          try {
            msg.payload = JSON.parse(data);
          } catch(err) {
            msg.payload = data;
          }
        } else {
          if (msg._httpErrorInterrupt && msg._httpErrorInterrupt.length > 0) {
            console.log(`${response}`);
            msg.payload = {
              status: response.status,
              statusText: response.statusText,
            }
            node.goto(msg, msg._httpErrorInterrupt);
            return;
          }
        }
      } catch(err) {
        console.log(err);
        if (msg._httpErrorInterrupt && msg._httpErrorInterrupt.length > 0) {
          msg.payload = {
            code: err.code,
            type: err.type,
            errno: err.errno,
            message: err.message,
          }
          node.goto(msg, msg._httpErrorInterrupt);
          return;
        }
      }
      node.send(msg);
    });
  }
  DORA.registerType('post', POSTRequest);

  /*
   *
   *
   */
  function GETRequest(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      let message = options;
      if (isTemplated) {
        message = utils.mustache.render(message, msg);
      }
      var body = msg.payload;
      try {
        let response = await fetch(`${message}`, {
          method: 'GET',
          body,
          timeout: ('httpTimeout' in msg)?msg.httpTimeout:3000,
        })
        if (response.ok) {
          const data = await response.text();
          try {
            msg.payload = JSON.parse(data);
          } catch(err) {
            msg.payload = data;
          }
        } else {
          if (msg._httpErrorInterrupt && msg._httpErrorInterrupt.length > 0) {
            console.log(`${response}`);
            msg.payload = {
              status: response.status,
              statusText: response.statusText,
            }
            node.goto(msg, msg._httpErrorInterrupt);
            return;
          }
        }
      } catch(err) {
        console.log(err);
        if (msg._httpErrorInterrupt && msg._httpErrorInterrupt.length > 0) {
          msg.payload = {
            code: err.code,
            type: err.type,
            errno: err.errno,
            message: err.message,
          }
          node.goto(msg, msg._httpErrorInterrupt);
          return;
        }
      }
      node.send(msg);
    });
  }
  DORA.registerType('get', GETRequest);

  /*
   *
   *
   */
  function HTTPError(node, options) {
    const labels = node.nextLabel(options);
    if (labels.length <= 0) throw new Error('ラベルを指定してください。')
    node.on("input", async function(msg) {
      msg._httpErrorInterrupt = labels;
      node.next(msg);
    });
  }
  DORA.registerType('error', HTTPError);

}
