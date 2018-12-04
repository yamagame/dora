const EventEmitter = require('events');
const Emitter = require('component-emitter');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

class Node extends Emitter {
  constructor(callback){
    super();
    this.callback = callback;
    this.wires = [];
    this._forks = {};
  }
  send(msg) {
    this.callback(msg);
  }
  next(msg) {
    this.callback(msg);
  }
  jump(msg) {
    this.callback(msg);
  }
  end(err, msg) {
    this.callback(msg);
  }
  fork(msg) {
    this.callback(msg);
  }
  credential() {
    return {}
  }
  nextLabel(label) {
    return [label];
  }
  isAlive() {
    return true;
  }
  join() {
  }
  dora() {
    return new Promise( resolved => {
      resolved({
        play: (msg, opt, cb) => {
          cb(null, msg);
        },
      })
    })
  }
  global() {
    return {
      _forks: this._forks,
    }
  }
}

const DORA = {
  module: '',
  types: {},
  registerType: function(name, func) {
    if (this.module === '') {
      this.types[name] = func;
    } else {
      this.types[`${this.module}.${name}`] = func;
    }
  }
}

const CallCommand = (command, msg, options, hook) => {
  return new Promise( resolved => {
    const stack = [];
    const node = new Node((msg) => {
      resolved(msg);
    })
    if (hook) hook(node, stack);
    DORA.types[command](node, options)
    node.emit('input', msg, stack);
  })
}

const core = require('../modules/core');
const http = require('../modules/http');
const led = require('../modules/led');
const quiz = require('../modules/quiz');
const config = {}

core(DORA, config);
DORA.module = 'http';
http(DORA, config);
DORA.module = 'led';
led(DORA, config);
DORA.module = 'quiz';
quiz(DORA, config);

describe('dora/modules/core', function() {

  before(function(done) {
    done();
  })

  after(function() {
  })

  describe('method', function() {
    it('now', async function() {
      const res = await CallCommand('now', {}, {});
      const now = new Date();
      assert.equal(typeof res.now !== 'undefined', true);
      assert.equal(res.now.year === now.getFullYear(), true);
      assert.equal(res.now.month === now.getMonth()+1, true);
      assert.equal(res.now.date === now.getDate(), true);
      assert.equal(res.now.hours === now.getHours(), true);
      assert.equal(res.now.minutes === now.getMinutes(), true);
    })

    it('log', async function() {
      const res = await CallCommand('log', {}, 'hello', node => {
        node.flow = {
          options: {
            socket: new EventEmitter(),
          }
        }
      });
    })

    it('error', async function() {
      const res = await CallCommand('error', {}, 'error-message', node => {
        node.err = (err) => {
          assert.equal(err.message === 'error-message', true);
          node.callback();
        }
      });
    })

    it('comment', async function() {
      const res = await CallCommand('comment', {}, '');
    })

    it('label', async function() {
      const res = await CallCommand('label', {
        labels: {},
      }, '', node => {
        node.flow = {
          labels: {},
        }
      });
    })

    it('if', async function() {
      const res = await CallCommand('if', {}, '');
    })

    it('goto', async function() {
      const res = await CallCommand('goto', {}, ':hoge');
    })

    it('gosub', async function() {
      const res = await CallCommand('gosub', {}, ':hoge');
    })

    it('return', async function() {
      const res = await CallCommand('return', {}, '', (node, stack) => {
        stack.push('hoge');
      });
    })

    it('goto.random', async function() {
      const res = await CallCommand('goto.random', {}, '');
    })

    it('goto.sequence', async function() {
      const res = await CallCommand('goto.sequence', {}, '');
    })

    it('delay', async function() {
      const res = await CallCommand('delay', {}, '');
    })

    it('end', async function() {
      const res = await CallCommand('end', {}, '');
    })

    it('fork', async function() {
      const res = await CallCommand('fork', {}, '');
    })

    it('push', async function() {
      const res = await CallCommand('push', {}, '');
    })

    it('pop', async function() {
      const res = await CallCommand('pop', {}, '');
    })

    it('join', async function() {
      const res = await CallCommand('join', {}, '');
    })

    it('joinLoop', async function() {
      const res = await CallCommand('joinLoop', {}, '');
    })

    it('topic', async function() {
      const res = await CallCommand('topic', {}, '');
    })

    it('other', async function() {
      const res = await CallCommand('other', {}, '');
    })

    it('sound', async function() {
      const res = await CallCommand('sound', {}, 'test.wav', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('set', async function() {
      const res = await CallCommand('set', {}, 'payload/100');
    })

    it('setString', async function() {
      const res = await CallCommand('setString', {}, 'payload/100');
    })

    it('setNumber', async function() {
      const res = await CallCommand('setNumber', {}, 'payload/100');
    })

    it('get', async function() {
      const res = await CallCommand('get', {}, 'payload');
    })

    it('change', async function() {
      const res1 = await CallCommand('change', {
      }, '.payload/.params');
      const res2 = await CallCommand('change', {
        payload: 0,
        params: 1,
      }, '.payload/.params');
    })

    it('text-to-speech', async function() {
      const res = await CallCommand('text-to-speech', {}, 'hello', node => {
        node.recording = true;
        node.flow = {
          options: {
            socket: {
              emit: (event, message, callback) => {
                callback({

                });
              }
            },
          }
        }
      });
    })

    it('speech-to-text', async function() {
      const res = await CallCommand('speech-to-text', {
        payload: 'hello',
      }, '', node => {
        node.flow = {
          options: {
            socket: {
              emit: (event, message, callback) => {
                callback({

                });
              }
            },
          }
        }
      });
    })

    it('wait-event', async function() {
      const res = await CallCommand('wait-event', {}, '', node => {
        node.flow = {
          options: {
            socket: {
              emit: (event, message, callback) => {
                callback({

                });
              }
            },
          }
        }
      });
    })

    it('stop-speech', async function() {
      const res = await CallCommand('stop-speech', {}, '', node => {
        node.flow = {
          options: {
            socket: {
              emit: (event, message, callback) => {
                callback({

                });
              }
            },
          }
        }
      });
    })

    it('join-flow', async function() {
      const res = await CallCommand('join-flow', {}, '', node => {
        node.flow = {
          options: {
            socket: {
              emit: (event, message, callback) => {
                callback({

                });
              }
            },
          }
        }
      });
    })

    it('chat', async function() {
      const res = await CallCommand('chat', {}, '', node => {
        node.flow = {
          options: {
            socket: {
              emit: (event, message, callback) => {
                callback({

                });
              }
            },
          }
        }
      });
    })

    it('docomo-chat', async function() {
      const res = await CallCommand('docomo-chat', {}, '', node => {
        node.flow = {
          options: {
            socket: {
              emit: (event, message, callback) => {
                callback({

                });
              }
            },
          }
        }
      });
    })

    it('switch', async function() {
      const res = await CallCommand('switch', {
        payload: 'hello',
      }, 'hello/:label');
    })

    it('check', async function() {
      const res = await CallCommand('check', {}, '');
    })

    it('mecab', async function() {
      const res = await CallCommand('mecab', {}, '');
    })

    it('mecabCheck', async function() {
      const res = await CallCommand('mecabCheck', {
        payload: 'hello',
      }, '');
    })

    it('payload', async function() {
      const res = await CallCommand('payload', {}, '');
    })

    it('call', async function() {
      const res = await CallCommand('call', {}, '', node => {
        node.flow = {
          options: {},
        }
      });
    })

    it('exec', async function() {
      const res = await CallCommand('exec', {}, '');
    })

    it('eval', async function() {
      const res = await CallCommand('eval', {}, '', node => {
        node.flow = {
          engine: {
            eval: (node, msg, opts, callback) => {
              callback(null, msg)
            },
          },
        }
      });
    })

    it('select', async function() {
      const res = await CallCommand('select', {}, '');
    })

    it('select.layout', async function() {
      const res = await CallCommand('select.layout', {}, '');
    })

    it('ok', async function() {
      const res = await CallCommand('ok', {}, '');
    })

    it('ok.image', async function() {
      const res = await CallCommand('ok.image', {}, '');
    })

    it('ng', async function() {
      const res = await CallCommand('ng', {}, '');
    })

    it('ng.image', async function() {
      const res = await CallCommand('ng.image', {}, '');
    })

    it('run', async function() {
      const res = await CallCommand('run', {}, 'hello');
      assert.equal(res._nextscript === 'hello', true);
    })

    it('append-to-google-sheet', async function() {
      const res = await CallCommand('append-to-google-sheet', {}, '');
    })
  })

});

describe('dora/modules/http', function() {

  before(function(done) {
    done();
  })

  after(function() {
  })

  describe('method', function() {
    it('post', async function() {
      const res = await CallCommand('http.post', {}, '');
    })

    it('get', async function() {
      const res = await CallCommand('http.get', {}, '');
    })

    it('credential.post', async function() {
      const res = await CallCommand('http.credential.post', {}, '');
    })

    it('error', async function() {
      const res = await CallCommand('http.error', {}, '');
    })
  })

});

describe('dora/modules/led', function() {

  before(function(done) {
    done();
  })

  after(function() {
  })

  describe('method', function() {
    it('on', async function() {
      const res = await CallCommand('led.on', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('off', async function() {
      const res = await CallCommand('led.off', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('blink', async function() {
      const res = await CallCommand('led.blink', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('auto', async function() {
      const res = await CallCommand('led.auto', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })
  })

});

describe('dora/modules/quiz', function() {

  before(function(done) {
    done();
  })

  after(function() {
  })

  describe('method', function() {
    it('greeting', async function() {
      const res = await CallCommand('quiz.greeting', {}, '');
    })

    it('entry', async function() {
      const res = await CallCommand('quiz.entry', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('title', async function() {
      const res = await CallCommand('quiz.title', {}, '');
    })

    it('slideURL', async function() {
      const res = await CallCommand('quiz.slideURL', {}, '');
    })

    it('slide', async function() {
      const res = await CallCommand('quiz.slide', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('edit', async function() {
      const res = await CallCommand('quiz.edit', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('preload', async function() {
      const res = await CallCommand('quiz.preload', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('startScreen', async function() {
      const res = await CallCommand('quiz.startScreen', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('init', async function() {
      const res = await CallCommand('quiz.init', {}, '');
    })

    it('id', async function() {
      const res = await CallCommand('quiz.id', {}, 'hoge');
    })

    it('shuffle', async function() {
      const res = await CallCommand('quiz.shuffle', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('timeLimit', async function() {
      const res = await CallCommand('quiz.timeLimit', {}, '');
    })

    it('select', async function() {
      const res = await CallCommand('quiz.select', {}, '');
    })

    it('select.layout', async function() {
      const res = await CallCommand('quiz.select.layout', {}, '');
    })

    it('answer', async function() {
      const res = await CallCommand('quiz.answer', {}, '');
    })

    it('ok', async function() {
      const res = await CallCommand('quiz.ok', {}, '');
    })

    it('ok.image', async function() {
      const res = await CallCommand('quiz.ok.image', {}, '');
    })

    it('ng', async function() {
      const res = await CallCommand('quiz.ng', {}, '');
    })

    it('ng.image', async function() {
      const res = await CallCommand('quiz.ng.image', {}, '');
    })

    it('option.fontScale', async function() {
      const res = await CallCommand('quiz.option.fontScale', {}, '');
    })

    it('option.marginTop', async function() {
      const res = await CallCommand('quiz.option.marginTop', {}, '');
    })

    it('option.reset', async function() {
      const res = await CallCommand('quiz.option.reset', {}, '');
    })

    it('optionButton', async function() {
      const res = await CallCommand('quiz.optionButton', {}, '');
    })

    it('optionImageButton', async function() {
      const res = await CallCommand('quiz.optionImageButton', {}, '');
    })

    it('sideImage', async function() {
      const res = await CallCommand('quiz.sideImage', {}, '');
    })

    it('image', async function() {
      const res = await CallCommand('quiz.image', {}, '');
    })

    it('messagePage', async function() {
      const res = await CallCommand('quiz.messagePage', {}, '');
    })

    it('slidePage', async function() {
      const res = await CallCommand('quiz.slidePage', {}, '');
    })

    it('show', async function() {
      const res = await CallCommand('quiz.show', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('open', async function() {
      const res = await CallCommand('quiz.open', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('yesno', async function() {
      const res = await CallCommand('quiz.yesno', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('quizPage', async function() {
      const res = await CallCommand('quiz.quizPage', {
        payload: {
          quiz: {
            question: 'question',
            choices: [],
            answers: [],
          }
        }
      }, '');
    })

    it('lastPage', async function() {
      const res = await CallCommand('quiz.lastPage', {
        payload: {
          quiz: {
            question: 'question',
            choices: [],
            answers: [],
          }
        }
      }, '');
    })

    it('wait', async function() {
      const res = await CallCommand('quiz.wait', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('start', async function() {
      const res = await CallCommand('quiz.start', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('timeCheck', async function() {
      const res = await CallCommand('quiz.timeCheck', {}, '');
    })

    it('stop', async function() {
      const res = await CallCommand('quiz.stop', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('result', async function() {
      const res = await CallCommand('quiz.result', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('ranking', async function() {
      const res = await CallCommand('quiz.ranking', {}, '', node => {
        node.flow = {
          request: () => {
            return new Promise( resolved => {
              resolved([]);
            })
          },
        }
      });
    })

    it('answerCheck', async function() {
      const res = await CallCommand('quiz.answerCheck', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('totalCount', async function() {
      const res = await CallCommand('quiz.totalCount', {}, '');
    })

    it('message.open', async function() {
      const res = await CallCommand('quiz.message.open', {}, '');
    })

    it('message.title', async function() {
      const res = await CallCommand('quiz.message.title', {}, '');
    })

    it('message.content', async function() {
      const res = await CallCommand('quiz.message.content', {}, '');
    })

    it('message.url', async function() {
      const res = await CallCommand('quiz.message.url', {}, '');
    })

    it('message.link', async function() {
      const res = await CallCommand('quiz.message.link', {}, '');
    })

    it('message', async function() {
      const res = await CallCommand('quiz.message', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('movie.play', async function() {
      const res = await CallCommand('quiz.movie.play', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('movie.check', async function() {
      const res = await CallCommand('quiz.movie.check', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('movie.cancel', async function() {
      const res = await CallCommand('quiz.movie.cancel', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })

    it('speech', async function() {
      const res = await CallCommand('quiz.speech', {}, '', node => {
        node.flow = {
          request: () => {},
        }
      });
    })
  })

});
