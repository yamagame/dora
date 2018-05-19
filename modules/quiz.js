const utils = require('../libs/utils');

module.exports = function(DRAGO, config) {

  /*
   *
   *
   */
  function QuizGreeting(node, options) {
    node.on("input", async function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      var d = new Date();
      console.log(d.getHours());
      if (d.getHours()+1 >= 11) {
        msg.quiz.greeting = 'こんにちは';
      } else {
        msg.quiz.greeting = 'おはようございます';
      }
      node.send(msg);
    });
  }
  DRAGO.registerType('greeting', QuizGreeting);

  /*
   *
   *
   */
  function QuizEntry(node, options) {
    node.on("input", async function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      await node.flow.request('command', {
        restype: 'text',
      }, {
        type: 'quiz',
        action: 'wait',
        pages: [],
      });
      await node.flow.request('command', {
        restype: 'text',
      }, {
        type: 'quiz',
        action: 'quiz-entry-init',
        name: "_quiz_master_",
      });
      await node.flow.request('command', {
        restype: 'text',
      }, {
        type: 'quiz',
        action: 'quiz-entry',
        title: (msg.quiz.message) ? msg.quiz.message.title : null,
        messages: (msg.quiz.message) ? msg.quiz.message.messages : null,
        links: (msg.quiz.message) ? [
          {
            title: msg.quiz.message.link,
            url: msg.quiz.message.url,
          }
        ] : null,
        name: "_quiz_master_",
      });
      node.send(msg);
    });
  }
  DRAGO.registerType('entry', QuizEntry);

  /*
   *
   *
   */
  function QuizTitle(node, options) {
    node.on("input", function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      msg.quiz.title = options;
      node.send(msg);
    });
  }
  DRAGO.registerType('title', QuizTitle);

  /*
   *
   *
   */
  function QuizSlideURL(node, options) {
    node.on("input", function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      msg.quiz.slideURL = options;
      node.send(msg);
    });
  }
  DRAGO.registerType('slideURL', QuizSlideURL);

  /*
   *
   *
   */
  function QuizSlide(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      if (isTemplated) {
          options = utils.mustache.render(options, msg);
      }
      await node.flow.request({
        type: 'quiz',
        action: 'slide',
        photo: `${options}`,
        pages: [],
      });
      node.send(msg);
    });
  }
  DRAGO.registerType('slide', QuizSlide);

  /*
   *
   *
   */
  function QuizInit(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      if (isTemplated) {
          options = utils.mustache.render(options, msg);
      }
      msg.quiz.timer = 0;
      msg.quiz.pages = [];
      msg.quiz.quizId = (options) ? options : ((msg.quiz.quizId) ? msg.quiz.quizId : msg.quiz.title);
      node.send(msg);
    });
  }
  DRAGO.registerType('init', QuizInit);

  /*
   *
   *
   */
  function QuizId(node, options) {
    if (!options) {
      throw new Error('クイズIDが指定されていません。');
    }
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      if (isTemplated) {
          options = utils.mustache.render(options, msg);
      }
      msg.quiz.quizId = options;
      node.send(msg);
    });
  }
  DRAGO.registerType('id', QuizId);

  /*
   *
   *
   */
  function QuizShuffle(node, options) {
    node.on("input", async function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      await node.flow.request({
        type: 'quiz',
        action: 'quiz-shuffle',
      });
      node.send(msg);
    });
  }
  DRAGO.registerType('shuffle', QuizShuffle);

  /*
   *
   *
   */
  function QuizTimelimit(node, options) {
    node.on("input", function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      msg.quiz.timeLimit = parseInt(options);
      node.send(msg);
    });
  }
  DRAGO.registerType('timeLimit', QuizTimelimit);

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

  /*
   *
   *
   */
  function QuizMessagePage(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      if (isTemplated) {
          options = utils.mustache.render(options, msg);
      }
      msg.quiz.pages.push({
        action: 'message',
        title: `${options}`,
        messages: [
          "右上のボタンで次のページへ進んでください。"
        ],
      });
      node.send(msg);
    });
  }
  DRAGO.registerType('messagePage', QuizMessagePage);

  /*
   *
   *
   */
  function QuizSlidePage(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      if (isTemplated) {
          options = utils.mustache.render(options, msg);
      }
      msg.quiz.pages.push({
        action: 'slide',
        photo: `${options}`,
      });
      node.send(msg);
    });
  }
  DRAGO.registerType('slidePage', QuizSlidePage);

  /*
   *
   *
   */
  function QuizOpen(node, options) {
    node.on("input", async function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      const payload = await node.flow.request({
        type: 'quiz',
        action: 'quiz-init',
        time: msg.quiz.timeLimit,
        pages: msg.quiz.pages,
        pageNumber: 0,
        quizId: msg.quiz.quizId,
        showSum: false,
      });
      console.log(payload);
      msg.quiz.startTime = payload;
      msg.quiz.quizCount = msg.quiz.pages.filter( a => a.action == 'quiz').length;
      node.send(msg);
    });
  }
  DRAGO.registerType('open', QuizOpen);

  /*
   *
   *
   */
  function QuizYesno(node, options) {
    node.on("input", async function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      const payload = await node.flow.request({
        type: 'quiz',
        action: 'quiz-init',
        time: msg.quiz.timeLimit,
        pages: msg.quiz.pages,
        pageNumber: 0,
        quizId: msg.quiz.quizId,
        showSum: true,
      });
      console.log(payload);
      msg.quiz.startTime = payload;
      msg.quiz.quizCount = msg.quiz.pages.filter( a => a.action == 'quiz').length;
      node.send(msg);
    });
  }
  DRAGO.registerType('yesno', QuizYesno);

  /*
   *
   *
   */
  function QuizLastPage(node, options) {
    node.on("input", function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      const lastPage = msg.quiz.pages[msg.quiz.pages.length-1];
      //ラストページに結果表示画面を追加
      if (lastPage.action !== 'result') {
        msg.quiz.pages.push({
          action: 'result',
          title: 'しばらくお待ちください',
        });
      }
      node.send(msg);
    });
  }
  DRAGO.registerType('lastPage', QuizLastPage);

  /*
   *
   *
   */
  function QuizWait(node, options) {
    const params = (options) ? options.split('/') : [];
    if (params.length > 0) {
      node.nextLabel(params.join('/'))
    }
    node.on("input", async function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      await utils.timeout(1000);
      await node.flow.request({
        type: 'quiz',
        action: 'quiz-start',
        time: msg.quiz.timeLimit-msg.quiz.timer,
        pages: msg.quiz.pages,
        quizId: msg.quiz.quizId,
      });
      msg.quiz.timer ++;
      if (node.wires.length > 1) {
        if (msg.quiz.timer > msg.quiz.timeLimit) {
          msg.quiz.timer = msg.quiz.timeLimit;
          node.send([msg, null]);
        } else {
          node.send([null, msg]);
        }
      } else {
        node.send(msg);
      }
    });
  }
  DRAGO.registerType('wait', QuizWait);

  /*
   *
   *
   */
  function QuizTimeCheck(node, options) {
    const params = options.split('/');
    const waitTime = parseInt(params[0]);
    if (params.length > 1) {
       node.nextLabel(params.slice(1).join('/'))
    }
    node.on("input", function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      const { timer, timeLimit } = msg.quiz;
      const n = [];
      if ((waitTime < 0 && timer-timeLimit == waitTime) || (timer == waitTime)) {
        node.jump(msg);
      } else {
        node.next(msg);
      }
    });
  }
  DRAGO.registerType('timeCheck', QuizTimeCheck);

  /*
   *
   *
   */
  function QuizStop(node, options) {
    node.on("input", async function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      await node.flow.request({
        type: 'quiz',
        action: 'quiz-stop',
      });
      node.send(msg);
    });
  }
  DRAGO.registerType('stop', QuizStop);

  /*
   *
   *
   */
  function QuizResult(node, options) {
    let pageNumber = null;
    if (options !== null) {
      pageNumber = parseInt(options);
    }
    node.on("input", async function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      const { pages } = msg.quiz;
      if (pageNumber === null) {
        let num = 0;
        for (var i=0;i<pages.length-1;i++) {
          if (pages[i].action === 'quiz') {
            await node.flow.request('command', {
              restype: 'text',
            }, {
              type: 'quiz',
              action: 'quiz-answer',
              pageNumber: i,
            });
            await node.flow.request('text-to-speech', {
              restype: 'text',
            }, {
              message: `${num+1}問目の答えはこれです`,
            });
            await utils.timeout(3000);
            num ++;
          }
        }
        await node.flow.request('command', {
            restype: 'text',
          }, {
          type: 'quiz',
          action: 'quiz-answer',
          pageNumber: pages.length-1,
        });
      } else {
        await node.flow.request('command', {
          restype: 'text',
        }, {
          type: 'quiz',
          action: 'quiz-answer',
          pageNumber,
        });
        await node.flow.request('command', {
            restype: 'text',
          }, {
          type: 'quiz',
          action: 'quiz-answer',
          pageNumber,
        });
      }
      node.send(msg);
    });
  }
  DRAGO.registerType('result', QuizResult);

  /*
   *
   *
   */
  function QuizRanking(node, options) {
    node.nextLabel(options)
    node.on("input", async function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      const quizAnswers = await node.flow.request({
        type: 'quiz',
        action: 'quiz-ranking',
        name: '_quiz_master_',
        quizId: msg.quiz.quizId,
        pages: msg.quiz.pages,
        quizStartTime: msg.quiz.startTime,
      });
      msg.quiz.quizAnswers = quizAnswers;

      const startTime = new Date(msg.quiz.startTime);
      const result = {};
      const answerCheck = (question, answer) => {
        return msg.quiz.pages.some( page => {
          if (typeof page.question !== 'undefined' && page.question === question) {
            return page.answers.some( a => a == answer);
          }
        });
      }
      console.log(msg.quiz.quizAnswers);
      var debugCount = 0;
      const quizCount = msg.quiz.pages.filter( a => a.action == 'quiz').length;
      Object.keys(msg.quiz.quizAnswers).forEach( question => {
        const players = msg.quiz.quizAnswers[question];
        Object.keys(players).forEach( clientId => {
          const name = players[clientId].name;
          const answer = players[clientId].answer;
          const time = new Date(players[clientId].time);
          if (typeof result[name] === 'undefined') {
            result[name] = { time: time, answer: answer, point: 0 };
          } else
          if (result[name].time.getTime() < time.getTime()) {
            result[name] = { time: time, answer: answer, point: result[name].point };
          }
          if (answerCheck(question, answer)) {
            result[name].point ++;
          }
        });
      });
      const ranking = Object.keys(result).map( name => {
                                            return {
                                              name: name,
                                              time: result[name].time,
                                              answer: result[name].answer,
                                              point: result[name].point,
                                            }})
                                        .filter( p => p.point == quizCount )
                                        .sort(  (a,b) => {
                                          const at = new Date(a.time).getTime();
                                          const bt = new Date(b.time).getTime();
                                          return (at < bt) ? -1 : ((at > bt) ? 1 : 0) ;
                                        } );
      msg.quizCount = quizCount;
      msg.ranking = ranking;
      msg.debugCount = debugCount;

      console.log(ranking);

      if (ranking.length === 0) {
          node.send([msg, null]);
      } else {
          node.send([null, msg]);
      }
    });
  }
  DRAGO.registerType('ranking', QuizRanking);

  /*
   *
   *
   */
  function QuizAnswerCheck(node, options) {
    const params = options.split('/');
    let threshold = null;
    if (params.length > 0) {
      if (params[0].indexOf(':') == 0) {
        node.nextLabel(params.join('/'))
      } else {
        threshold = parseInt(params[0]);
        if (params.length > 1) {
          node.nextLabel(params.slice(1).join('/'))
        }
      }
    }
    node.on("input", async function(msg) {
      if (typeof msg.quiz === 'undefined') msg.quiz = {};
      const data = await node.flow.request('result', {
        type: 'answers',
        quizId: msg.quiz.quizId,
        startTime: msg.quiz.startTime,
      });
      const pages = msg.quiz.pages;
      const sumQuestions = {};
      let totalCount = 0;
      let okCount = 0;
      pages.forEach( page => {
        if (page.action === 'quiz') {
          const r = {}
          if (data.answers) {
            const t = data.answers[page.question];
            Object.keys(t).forEach(key => {
              if (typeof r[t[key].answer] === 'undefined') r[t[key].answer] = { count: 0 };
              r[t[key].answer].count ++;
              data.question.quiz[page.question].answers.forEach( n => {
                if (n === t[key].answer) {
                  r[t[key].answer].ok = true;
                }
              });
              if (r[t[key].answer].ok) {
                okCount ++;
              }
              totalCount ++;
            });
          }
          sumQuestions[page.question] = r;
        }
      });

      const rate = () => {
        if (totalCount <= 0) {
          //返事がない
          return 0;
        } else
        if (totalCount === okCount) {
          //全員OK
          return 100;
        } else
        if (okCount === 0) {
          //全員NG
          return 0;
        } else {
          return okCount*100/totalCount;
        }
      }

      console.log(JSON.stringify(sumQuestions));
      console.log(`okCount:${okCount} total:${totalCount}`);

      msg.okCount = okCount;
      msg.totalCount = totalCount;

      if ((threshold !== null && rate() >= threshold) || (threshold === null && rate() > 0)) {
        node.jump(msg);
      } else {
        node.next(msg);
      }
    });
  }
  DRAGO.registerType('answerCheck', QuizAnswerCheck);

  /*
   *
   *
   */
  function initMessage(msg) {
    if (typeof msg.quiz === 'undefined') msg.quiz = {};
    if (typeof msg.quiz.title === 'undefined') msg.quiz.title = '';
    if (typeof msg.quiz.message === 'undefined') msg.quiz.message = {};
    if (typeof msg.quiz.message.messages === 'undefined') msg.quiz.message.messages = [];
  }

  /*
   *
   *
   */
  function QuizMessageOpen(node, options) {
    node.on("input", function(msg) {
      initMessage(msg);
      msg.quiz.message = {}
      msg.quiz.message.messages = [];
      node.send(msg);
    });
  }
  DRAGO.registerType('message.open', QuizMessageOpen);

  /*
   *
   *
   */
  function QuizMessageTitle(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", function(msg) {
      initMessage(msg);
      if (isTemplated) {
          options = utils.mustache.render(options, msg);
      }
      msg.quiz.message.title = options;
      node.send(msg);
    });
  }
  DRAGO.registerType('message.title', QuizMessageTitle);

  /*
   *
   *
   */
  function QuizMessageContent(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", function(msg) {
      initMessage(msg);
      if (isTemplated) {
          options = utils.mustache.render(options, msg);
      }
      msg.quiz.message.messages.push(options);
      node.send(msg);
    });
  }
  DRAGO.registerType('message.content', QuizMessageContent);

  /*
   *
   *
   */
  function QuizMessageUrl(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", function(msg) {
      initMessage(msg);
      if (isTemplated) {
          options = utils.mustache.render(options, msg);
      }
      msg.quiz.message.url = options;
      node.send(msg);
    });
  }
  DRAGO.registerType('message.url', QuizMessageUrl);

  /*
   *
   *
   */
  function QuizMessageLink(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", function(msg) {
      initMessage(msg);
      if (isTemplated) {
          options = utils.mustache.render(options, msg);
      }
      msg.quiz.message.link = options;
      node.send(msg);
    });
  }
  DRAGO.registerType('message.link', QuizMessageLink);

  /*
   *
   *
   */
  function QuizMessage(node, options) {
    node.on("input", async function(msg) {
      initMessage(msg);
      await node.flow.request({
        type: 'quiz',
        action: 'message',
        pages: [],
        title: msg.quiz.message.title,
        messages: msg.quiz.message.messages,
        links: [
          {
            title: msg.quiz.message.link,
            url: msg.quiz.message.url,
          }
        ],
      })
      node.send(msg);
    });
  }
  DRAGO.registerType('message', QuizMessage);

  /*
   *
   *
   */
  function QuizMoviePlay(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      initMessage(msg);
      if (isTemplated) {
          options = utils.mustache.render(options, msg);
      }
      await node.flow.request({
        type: 'movie',
        action: 'play',
        movie: options,
      })
      node.send(msg);
    });
  }
  DRAGO.registerType('movie.play', QuizMoviePlay);

  /*
   *
   *
   */
  function QuizMovieCheck(node, options) {
    node.nextLabel(options)
    node.on("input", async function(msg) {
      setTimeout(async () => {
        const res = await node.flow.request({
          type: 'movie',
          action: 'check',
        })
        if (res.state === 'play') {
          node.jump(msg);
        } else {
          node.next(msg);
        }
      }, 1000);
    });
  }
  DRAGO.registerType('movie.check', QuizMovieCheck);

  /*
   *
   *
   */
  function QuizMovieCancel(node, options) {
    node.on("input", async function(msg) {
      await node.flow.request({
        type: 'movie',
        action: 'cancel',
      })
      node.send(msg);
    });
  }
  DRAGO.registerType('movie.cancel', QuizMovieCancel);
}
