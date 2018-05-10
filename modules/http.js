const utils = require('../libs/utils');
const fetch = require('node-fetch');

module.exports = function(DRAGO, config) {

  /*
   *
   *
   */
  function POSTRequest(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      if (isTemplated) {
          options = utils.mustache.render(options, msg);
      }
      let response = await fetch(`${options}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(msg.payload)
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
  DRAGO.registerType('post', POSTRequest);

  /*
   *
   *
   */
  function GETRequest(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      if (isTemplated) {
          options = utils.mustache.render(options, msg);
      }
      let response = await fetch(`${options}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(msg.payload)
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
  DRAGO.registerType('get', GETRequest);

}
