const utils = require('../libs/utils');
const fetch = require('node-fetch');

module.exports = function(DORA, config) {

  /*
   *
   *
   */
  function LEDOn(node, options) {
    node.on("input", async function(msg) {
      await node.flow.request({
        type: 'led',
        action: 'on',
      });
      node.send(msg);
    });
  }
  DORA.registerType('on', LEDOn);

  /*
   *
   *
   */
  function LEDOff(node, options) {
    node.on("input", async function(msg) {
      await node.flow.request({
        type: 'led',
        action: 'off',
      });
      node.send(msg);
    });
  }
  DORA.registerType('off', LEDOff);

  /*
   *
   *
   */
  function LEDBlink(node, options) {
    node.on("input", async function(msg) {
      await node.flow.request({
        type: 'led',
        action: 'blink',
      });
      node.send(msg);
    });
  }
  DORA.registerType('blink', LEDBlink);

  /*
   *
   *
   */
  function LEDAuto(node, options) {
    node.on("input", async function(msg) {
      await node.flow.request({
        type: 'led',
        action: 'auto',
      });
      node.send(msg);
    });
  }
  DORA.registerType('auto', LEDAuto);

}
