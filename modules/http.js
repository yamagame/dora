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
      let response = await fetch(`${message}`, {
        method: 'POST',
        headers,
        body,
      })
      const data = await response.text();
      try {
        msg.payload = JSON.parse(data);
      } catch(err) {
        msg.payload = data;
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
      let response = await fetch(`${message}`, {
        method: 'GET',
        body,
      })
      const data = await response.text();
      try {
        msg.payload = JSON.parse(data);
      } catch(err) {
        msg.payload = data;
      }
      node.send(msg);
    });
  }
  DORA.registerType('get', GETRequest);

}
