const utils = require('../libs/utils');
const clone = require('clone');

module.exports = function(DRAGO, config) {
  /*
   *
   *
   */
  function CoreLog(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      var message = options || msg.payload;
      if (isTemplated) {
          message = utils.mustache.render(message, msg);
      }
      console.log(message);
      node.send(msg);
    });
  }
  DRAGO.registerType('log', CoreLog);

  /*
   *
   *
   */
  function CoreError(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", function(msg) {
      var message = options || msg.payload;
      if (isTemplated) {
          message = utils.mustache.render(message, msg);
      }
      node.err(new Error(message));
    });
  }
  DRAGO.registerType('error', CoreError);

  /*
   *
   *
   */
  function CoreComment(node, options) {
    node.on("input", function(msg) {
      node.send(msg);
    });
  }
  DRAGO.registerType('comment', CoreComment);

  /*
   *
   *
   */
  function CoreLabel(node, options) {
    const p = options.split('/');
    const name = p[0];
    const args = p.slice(1);
    node.labelName = name;
    node.on("input", function(msg) {
      if (typeof msg.labels[name] === 'undefined') {
        msg.labels[name] = 0;
      }
      msg.labels[name].value ++;
      node.send(msg);
    });
  }
  DRAGO.registerType('label', CoreLabel);

  /*
   *
   *
   */
  function CoreIf(node, options) {
    const params = options.split('/');
    const form = params[0];
    node.nextLabel(form.slice(1).join('/'));
    node.on("input", function(msg) {
      if (msg.labels[form].value) {
        node.jump(msg);
      } else {
        node.next(msg);
      }
    });
  }
  DRAGO.registerType('if', CoreIf);

  /*
   *
   *
   */
  function CoreGoto(node, options) {
    node.nextLabel(options);
    node.on("input", function(msg) {
      node.jump(msg);
    });
  }
  DRAGO.registerType('goto', CoreGoto);

  /*
   *
   *
   */
  function CoreDelay(node, options) {
    node.on("input", async function(msg) {
      await utils.timeout(1000*parseFloat(options));
      node.send(msg);
    });
  }
  DRAGO.registerType('delay', CoreDelay);

  /*
   *
   *
   */
  function CoreEnd(node, options) {
    node.on("input", function(msg) {
      node.end(null, msg);
    });
  }
  DRAGO.registerType('end', CoreEnd);

  /*
   *
   *
   */
  function CoreFork(node, options) {
    node.nextLabel(options);
    node.on("input", function(msg) {
      var forkid = utils.generateId();
      if (!this.global()._forks) {
        this.global()._forks = {};
      }
      if (!this.global()._forks[forkid]) {
        this.global()._forks[forkid] = {}
      }
      var forks = this.global()._forks[forkid];
      var numOutputs = this.wires.length-1;
      if (!msg._forks) msg._forks = [];
      msg._forks.push(forkid);
      forks.numWire = numOutputs;
      forks.priority = 0;
      forks.name = "";
      forks.msg = {};
      node.fork(msg);
    });
  }
  DRAGO.registerType('fork', CoreFork);

  /*
   *
   *
   */
  function CorePush(node, options) {
    node.on("input", function(msg) {
      if (!msg.stack) msg.stack = [];
      if (options === null) {
        options = msg.payload;
      }
      msg.stack.push(options);
      node.send(msg);
    });
  }
  DRAGO.registerType('push', CorePush);

  /*
   *
   *
   */
  function CorePop(node, options) {
    node.on("input", function(msg) {
      if (!msg.stack) msg.stack = [];
      msg.payload = msg.stack.pop();
      node.send(msg);
    });
  }
  DRAGO.registerType('pop', CorePop);

  /*
   *
   *
   */
  function CoreJoin(node, options) {
    node.nextLabel(options);
    node.on("input", function(msg) {
      if (msg._forks) {
        const forkid = msg._forks[msg._forks.length-1];
        if (this.global()._forks && this.global()._forks[forkid]) {
          var forks = this.global()._forks[forkid];
          if (typeof msg.topicPriority !== 'undefined' && forks.priority < msg.topicPriority) {
            forks.priority = msg.topicPriority;
            forks.name = msg.topic;
            forks.msg = clone(msg);
          }
          forks.numWire --;
          if (forks.numWire <= 0) {
            msg._forks.pop();
            const forkid = msg._forks[msg._forks.length-1];
            if (typeof forks.msg.topic !== 'undefined' && forks.msg.topicPriority !== 0) {
              forks.msg._forks = msg._forks;
              if (node.wires.length > 1) {
                node.jump(forks.msg);
              } else {
                node.next(forks.msg);
              }
            } else {
              if (msg.topicPriority === 0) {
                delete msg.topic;
              }
              if (node.wires.length > 1) {
                node.jump(msg);
              } else {
                node.next(msg);
              }
            }
            return;
          }
        }
      }
      node.end();
    });
  }
  DRAGO.registerType('join', CoreJoin);

  /*
   *
   *
   */
  function CorePriority(node, options) {
    node.on("input", function(msg) {
      if (typeof msg.topicPriority === 'undefined') {
        msg.topicPriority = 0;
      }
      msg.topicPriority = msg.topicPriority + ((options === null) ? 10 : parseInt(options));
      node.send(msg);
    });
  }
  DRAGO.registerType('priority', CorePriority);

  /*
   *
   *
   */
  function CoreTopic(node, options) {
    node.on("input", function(msg) {
      msg.topic = options;
      msg.topicPriority = (typeof msg.topicPriority !== 'undefined') ? msg.topicPriority : 0;
      node.send(msg);
    });
  }
  DRAGO.registerType('topic', CoreTopic);

  /*
   *
   *
   */
  function Sound(node, options) {
    node.on("input", async function(msg) {
      await node.flow.request({
        type: 'sound',
        sound: options,
      });
      node.send(msg);
    });
  }
  DRAGO.registerType('sound', Sound);

  /*
   *
   *
   */
  function CoreSet(node, options) {
    const p = options.split('/');
    const field = p[0].split('.');
    node.on("input", async function(msg) {
      let t = msg;
      let key = null;
      let v = msg;
      field.forEach( f => {
        if (typeof t !== 'undefined') {
          key = f;
          v = t
          t = t[f];
        }
      });
      if (typeof v !== 'undefined' && typeof key !== 'undefined') v[key]= p.slice(1).join('/');
      node.send(msg);
    });
  }
  DRAGO.registerType('set', CoreSet);

  /*
   *
   *
   */
  function CoreGet(node, options) {
    const p = options.split('/');
    const field = p[0].split('.');
    node.on("input", async function(msg) {
      let t = msg;
      field.forEach( f => {
        if (typeof t !== 'undefined') {
          t = t[f];
        }
      });
      if (typeof t !== 'undefined') {
        msg.payload = t;
      }
      node.send(msg);
    });
  }
  DRAGO.registerType('get', CoreGet);

  /*
   *
   *
   */
  function TextToSpeech(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      const { socket } = node.flow.options;
      var message = options || msg.payload;
      if (isTemplated) {
          message = utils.mustache.render(message, msg);
      }
      if (msg.silence) {
        msg.payload = message;
        node.send(msg);
      } else {
        socket.emit('text-to-speech', { message }, (err, res) => {
          msg.payload = message;
          node.send(msg);
        });
      }
    });
  }
  DRAGO.registerType('text-to-speech', TextToSpeech);

  /*
   *
   *
   */
  function SpeechToText(node, options) {
    node.nextLabel(options);
    node.on("input", function(msg) {
      const { socket } = node.flow.options;
      const params = {
        timeout: 30000,
        sensitivity: 'keep',
      };
      if (typeof msg.timeout !== 'undefined') {
        params.timeout = msg.timeout;
      }
      if (typeof msg.sensitivity !== 'undefined') {
        params.sensitivity = msg.sensitivity;
      }
      node.recording = true;
      socket.emit('speech-to-text', params, (res) => {
        if (!node.recording) return;
        node.recording = false;
        if (res == '[timeout]') {
          msg.payload = 'timeout';
          node.send([msg, null]);
        } else
        if (res == '[canceled]') {
          msg.payload = 'canceled';
          node.send([msg, null]);
        } else {
          if (res.button) {
            msg.payload = 'button';
            msg.button = res;
            delete res.button;
            node.send([msg, null]);
          } else
          if (res.speechRequest) {
            msg.speechRequest = true;
            msg.payload = res.payload;
            msg.speechText = msg.payload;
            node.send([null, msg]);
          } else {
            msg.payload = res;
            msg.speechText = msg.payload;
            delete msg.speechRequest;
            node.send([null, msg]);
          }
        }
      });
    });
  }
  DRAGO.registerType('speech-to-text', SpeechToText);

  /*
   *
   *
   */
  function CoreSwitch(node, options) {
    const params = options.split('/');
    var string = params[0];
    var isTemplated = (string||"").indexOf("{{") != -1;
    if (params.length > 1) {
       node.nextLabel(params.slice(1).join('/'))
    } else {
       node.nextLabel(string)
    }
    node.on("input", function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      const n = [];
      if (isTemplated) {
          string = utils.mustache.render(string, msg);
      }
      if (string.trim() == msg.payload.trim()) {
        node.jump(msg);
      } else {
        node.next(msg);
      }
    });
  }
  DRAGO.registerType('switch', CoreSwitch);

  /*
   *
   *
   */
  function CoreCheck(node, options) {
    const params = options.split('/');
    var string = params[0];
    var isTemplated = (string||"").indexOf("{{") != -1;
    var priority = 10;
    if (params.length > 1) {
      priority = parseInt(params[1]);
    }
    node.on("input", function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      const n = [];
      if (isTemplated) {
          string = utils.mustache.render(string, msg);
      }
      if (msg.payload.indexOf(string) >= 0) {
        msg.topicPriority = (typeof msg.topicPriority !== 'undefined') ? msg.topicPriority : 0;
        msg.topicPriority += priority;
      }
      node.send(msg);
    });
  }
  DRAGO.registerType('check', CoreCheck);

  /*
   *
   *
   */
  function CorePayload(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", function(msg) {
      var message = options || msg.payload;
      if (isTemplated) {
          message = utils.mustache.render(message, msg);
      }
      msg.payload = message;
      node.send(msg);
    });
  }
  DRAGO.registerType('payload', CorePayload);

  /*
   *
   *
   */
  function CoreCall(node, options) {
    node.options = options
    node.on("input", function(msg) {
      const opt = {}
      Object.keys(node.flow.options).forEach( key => {
        opt[key] = node.flow.options[key]; 
      })
      opt.range = {
        start: 0,
      }
      node.dora.play(msg, opt, (err, msg) => {
        node.send(msg);
      });
    });
  }
  DRAGO.registerType('call', CoreCall);

  /*
   *
   *
   */
  function CoreEval(node, options) {
    node.on("input", function(msg) {
      var script = options;
      //eval(script);
      node.send(msg);
    });
  }
  DRAGO.registerType('eval', CoreEval);

  /*
   *
   *
   */
  function QuizSelect(node, options) {
    node.on("input", function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      msg.quiz.pages.push({
        action: 'quiz',
        question: options,
        choices: [],
        answers: [],
      });
      node.send(msg);
    });
  }
  DRAGO.registerType('select', QuizSelect);

  /*
   *
   *
   */
  function QuizOptionOK(node, options) {
    node.on("input", function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      msg.quiz.pages[msg.quiz.pages.length-1].choices.push(options);
      msg.quiz.pages[msg.quiz.pages.length-1].answers.push(options);
      node.send(msg);
    });
  }
  DRAGO.registerType('ok', QuizOptionOK);

  /*
   *
   *
   */
  function QuizOptionNG(node, options) {
    node.on("input", function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      msg.quiz.pages[msg.quiz.pages.length-1].choices.push(options);
      node.send(msg);
    });
  }
  DRAGO.registerType('ng', QuizOptionNG);
}
