const EventEmitter = require("events");
const Emitter = require("component-emitter");
const path = require("path");
const fs = require("fs");
const assert = require("assert");

class Node extends Emitter {
  constructor(callback) {
    super();
    this.callback = callback;
    this.wires = [":next"];
    this._forks = {};
  }
  send(msg) {
    this.callback(msg);
  }
  next(msg) {
    msg.emit = "next";
    this.callback(msg);
  }
  jump(msg) {
    msg.emit = "jump";
    this.callback(msg);
  }
  end(err, msg) {
    msg.emit = "end";
    this.callback(msg);
  }
  fork(msg) {
    this.callback(msg);
  }
  credential() {
    return {};
  }
  nextLabel(label) {
    label = label.split("/");
    label = label.slice(0);
    for (var i = 0; i < label.length; i++) {
      this.wires.push(label[i]);
    }
    return [label];
  }
  isAlive() {
    return true;
  }
  join() {}
  dora() {
    return new Promise(resolved => {
      resolved({
        play: (msg, opt, cb) => {
          cb(null, msg);
        },
      });
    });
  }
  global() {
    return {
      _forks: this._forks,
    };
  }
}

const DORA = {
  module: "",
  types: {},
  registerType: function (name, func) {
    if (this.module === "") {
      this.types[name] = func;
    } else {
      this.types[`${this.module}.${name}`] = func;
    }
  },
};

const InitCommand = (command, options) => {
  const node = new Node();
  DORA.types[command](node, options);
  return node;
};

const CallCommand = (node, msg) => {
  return new Promise(resolved => {
    if (typeof msg.stack === "undefined") msg.stack = [];
    node.callback = msg => {
      resolved(msg);
    };
    node.emit("input", msg, msg.stack);
  });
};

const core = require("../modules/core");
const http = require("../modules/http");
const led = require("../modules/led");
const quiz = require("../modules/quiz");
const config = {};

core(DORA, config);
DORA.module = "http";
http(DORA, config);
DORA.module = "led";
led(DORA, config);
DORA.module = "quiz";
quiz(DORA, config);

describe("dora/modules/core", function () {
  beforeAll(function () {
    jest.spyOn(console, "log").mockImplementation(x => {});
  });
  afterAll(function () {
    jest.restoreAllMocks();
  });

  it("now", async function () {
    const node = InitCommand("now", "");
    let msg = {};
    const now = new Date();
    msg = await CallCommand(node, msg);
    assert.equal(typeof msg.now !== "undefined", true);
    assert.equal(msg.now.year === now.getFullYear(), true);
    assert.equal(msg.now.month === now.getMonth() + 1, true);
    assert.equal(msg.now.date === now.getDate(), true);
    assert.equal(msg.now.hours === now.getHours(), true);
    assert.equal(msg.now.minutes === now.getMinutes(), true);
  });

  it("log", async function () {
    const node = InitCommand("log", "hello");
    let msg = {};
    const socket = new EventEmitter();
    node.flow = {
      options: {
        socket,
      },
    };
    let socketPayload = null;
    socket.on("dora-event", payload => {
      socketPayload = payload;
    });
    msg = await CallCommand(node, msg);
    assert.equal(socketPayload.action === "log", true);
    assert.equal(socketPayload.message === "hello", true);
  });

  it("error", async function () {
    const node = InitCommand("error", "error-message");
    let msg = {};
    node.err = err => {
      assert.equal(err.message === "error-message", true);
      node.callback();
    };
    msg = await CallCommand(node, msg);
  });

  it("comment", async function () {
    const node = InitCommand("comment", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("label", async function () {
    const node = InitCommand("label", "start");
    let msg = {
      labels: {},
    };
    node.flow = {
      labels: {},
    };
    msg = await CallCommand(node, msg);
    assert.equal(msg.labels["start"] === 1, true);
    assert.equal(msg.labels["test"] !== 0, true);
    msg = await CallCommand(node, msg);
    assert.equal(msg.labels["start"] === 2, true);
  });

  it("if", async function () {
    let msg = { payload: "100" };
    const node1 = InitCommand("if", "100/:label");
    msg = await CallCommand(node1, msg);
    assert.equal(msg.emit === "jump", true);
    const node2 = InitCommand("if", "10/:label");
    msg = await CallCommand(node2, msg);
    assert.equal(msg.emit === "jump", true);
    const node3 = InitCommand("if", "110/:label");
    msg = await CallCommand(node3, msg);
    assert.equal(msg.emit === "next", true);
    const node4 = InitCommand("if", "200/:label");
    msg = await CallCommand(node4, msg);
    assert.equal(msg.emit === "next", true);
    msg = { payload: "Hello" };
    const node5 = InitCommand("if", "hello/:label");
    msg = await CallCommand(node5, msg);
    assert.equal(msg.emit === "jump", true);
    const node6 = InitCommand("if", "Hello/:label");
    msg = await CallCommand(node6, msg);
    assert.equal(msg.emit === "jump", true);
    const node7 = InitCommand("if", "fello/:label");
    msg = await CallCommand(node7, msg);
    assert.equal(msg.emit === "next", true);
    const node8 = InitCommand("if", "hellohello/:label");
    msg = await CallCommand(node8, msg);
    assert.equal(msg.emit === "next", true);
  });

  it("goto", async function () {
    const node = InitCommand("goto", ":hoge");
    let msg = {};
    msg = await CallCommand(node, msg);
    assert.equal(msg.emit === "jump", true);
  });

  it("gosub", async function () {
    let msg = {};

    const node1 = InitCommand("gosub", ":hoge");
    msg = await CallCommand(node1, msg);
    assert.equal(msg.emit === "jump", true);

    const node2 = InitCommand("return", "");
    msg = await CallCommand(node2, msg);
    assert.equal(node2.wires[0] === ":hoge", true);
  });

  it("goto.random", async function () {
    const node = InitCommand("goto.random", ":A/:B/:C");
    let msg = {};
    msg = await CallCommand(node, msg);
    assert.equal(node._randtable.length === 3, true);
  });

  it("goto.sequence", async function () {
    const node = InitCommand("goto.sequence", ":A/:B/:C");
    let msg = {};
    msg = await CallCommand(node, msg);
    assert.equal(node._counter === 1, true);
    msg = await CallCommand(node, msg);
    assert.equal(node._counter === 2, true);
    msg = await CallCommand(node, msg);
    assert.equal(node._counter === 0, true);
  });

  it("delay", async function () {
    const node = InitCommand("delay", "1");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("end", async function () {
    const node = InitCommand("end", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("fork", async function () {
    const node = InitCommand("fork", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("push", async function () {
    const node = InitCommand("push", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("pop", async function () {
    const node = InitCommand("pop", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("join", async function () {
    const node = InitCommand("join", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("joinLoop", async function () {
    const node = InitCommand("joinLoop", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("join.loop", async function () {
    const node = InitCommand("join.loop", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("topic", async function () {
    const node = InitCommand("topic", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("other", async function () {
    const node = InitCommand("other", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("sound", async function () {
    const node = InitCommand("sound", "test.wav");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("set", async function () {
    const node1 = InitCommand("set", ".payload/100");
    let msg = {};
    msg = await CallCommand(node1, msg);
    assert.equal(msg.payload === 100, true);
    assert.equal(msg.payload === "100", false);

    const node2 = InitCommand("set", ".payload/10.2");
    msg = await CallCommand(node2, msg);
    assert.equal(msg.payload === 10.2, true);
    assert.equal(msg.payload === "10.2", false);
  });

  it("setString", async function () {
    const node = InitCommand("setString", ".payload/100");
    let msg = {};
    msg = await CallCommand(node, msg);
    assert.equal(msg.payload === "100", true);
  });

  it("set.string", async function () {
    const node = InitCommand("set.string", ".payload/100");
    let msg = {};
    msg = await CallCommand(node, msg);
    assert.equal(msg.payload === "100", true);
  });

  it("setNumber", async function () {
    const node1 = InitCommand("setNumber", ".payload/100");
    let msg = {};
    msg = await CallCommand(node1, msg);
    assert.equal(msg.payload === 100, true);
    assert.equal(msg.payload === "100", false);

    const node2 = InitCommand("setNumber", ".payload/10.2");
    msg = await CallCommand(node2, msg);
    assert.equal(msg.payload === 10.2, true);
    assert.equal(msg.payload === "10.2", false);
  });

  it("set.number", async function () {
    const node1 = InitCommand("set.number", ".payload/100");
    let msg = {};
    msg = await CallCommand(node1, msg);
    assert.equal(msg.payload === 100, true);
    assert.equal(msg.payload === "100", false);

    const node2 = InitCommand("set.number", ".payload/10.2");
    msg = await CallCommand(node2, msg);
    assert.equal(msg.payload === 10.2, true);
    assert.equal(msg.payload === "10.2", false);
  });

  it("get", async function () {
    let msg = { payload: "hello", v1: { v2: "val" } };

    const node1 = InitCommand("get", ".payload");
    msg = await CallCommand(node1, msg);
    assert.equal(msg.payload === "hello", true);

    const node2 = InitCommand("get", ".v1.v2");
    msg = await CallCommand(node2, msg);
    assert.equal(msg.payload === "val", true);
  });

  it("change", async function () {
    const node = InitCommand("change", ".payload/.params");
    let msg = {
      payload: 0,
      params: 1,
    };
    msg = await CallCommand(node, msg);
    msg = await CallCommand(node, msg);
  });

  it("text-to-speech", async function () {
    const node = InitCommand("text-to-speech", "hello");
    node.recording = true;
    node.flow = {
      options: {
        socket: {
          emit: (event, message, callback) => {
            callback({});
          },
        },
      },
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("speech-to-text", async function () {
    const node = InitCommand("speech-to-text", "");
    node.flow = {
      options: {
        socket: {
          emit: (event, message, callback) => {
            callback({});
          },
        },
      },
    };
    let msg = { payload: "hello" };
    msg = await CallCommand(node, msg);
  });

  it("wait-event", async function () {
    const node = InitCommand("wait-event", "");
    node.flow = {
      options: {
        socket: {
          emit: (event, message, callback) => {
            callback({});
          },
        },
      },
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("stop-speech", async function () {
    const node = InitCommand("stop-speech", "");
    node.flow = {
      options: {
        socket: {
          emit: (event, message, callback) => {
            callback({});
          },
        },
      },
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("join-flow", async function () {
    const node = InitCommand("join-flow", "");
    node.flow = {
      options: {
        socket: {
          emit: (event, message, callback) => {
            callback({});
          },
        },
      },
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("chat", async function () {
    const node = InitCommand("chat", "");
    node.flow = {
      options: {
        socket: {
          emit: (event, message, callback) => {
            callback({});
          },
        },
      },
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("docomo-chat", async function () {
    const node = InitCommand("docomo-chat", "");
    node.flow = {
      options: {
        socket: {
          emit: (event, message, callback) => {
            callback({});
          },
        },
      },
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("switch", async function () {
    let msg = { payload: "  hello   " };
    const node1 = InitCommand("switch", "hello/:label");
    msg = await CallCommand(node1, msg);
    assert.equal(msg.emit === "jump", true);
    const node2 = InitCommand("switch", "Hello/:label");
    msg = await CallCommand(node2, msg);
    assert.equal(msg.emit === "jump", true);
    const node3 = InitCommand("switch", "fello/:label");
    msg = await CallCommand(node3, msg);
    assert.equal(msg.emit === "next", true);
    const node4 = InitCommand("switch", "HelloWorld/:label");
    msg = await CallCommand(node4, msg);
    assert.equal(msg.emit === "next", true);
    const node5 = InitCommand("switch", " hello  /:label");
    msg = await CallCommand(node5, msg);
    assert.equal(msg.emit === "jump", true);
  });

  it("check", async function () {
    const node = InitCommand("check", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it.skip("mecab", async function () {
    const node = InitCommand("mecab", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it.skip("mecabCheck", async function () {
    const node = InitCommand("mecabCheck", "");
    let msg = { payload: "hello" };
    msg = await CallCommand(node, msg);
  });

  it.skip("mecab.check", async function () {
    const node = InitCommand("mecab.check", "");
    let msg = { payload: "hello" };
    msg = await CallCommand(node, msg);
  });

  it("payload", async function () {
    const node = InitCommand("payload", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("call", async function () {
    const node = InitCommand("call", "");
    node.flow = {
      options: {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("exec", async function () {
    const node = InitCommand("exec", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("eval", async function () {
    const node = InitCommand("eval", "");
    node.flow = {
      engine: {
        eval: (node, msg, opts, callback) => {
          callback(null, msg);
        },
      },
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("select", async function () {
    const node = InitCommand("select", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("select.layout", async function () {
    const node = InitCommand("select.layout", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("ok", async function () {
    const node = InitCommand("ok", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("ok.image", async function () {
    const node = InitCommand("ok.image", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("ng", async function () {
    const node = InitCommand("ng", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("ng.image", async function () {
    const node = InitCommand("ng.image", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("run", async function () {
    const node = InitCommand("run", "hello");
    let msg = {};
    msg = await CallCommand(node, msg);
    assert.equal(msg._nextscript === "hello", true);
  });

  it("append-to-google-sheet", async function () {
    const node = InitCommand("append-to-google-sheet", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("convert", async function () {
    let msg = {};
    const node1 = InitCommand("convert", "encodeURIComponent/あいうえお");
    msg = await CallCommand(node1, msg);
    assert.equal(
      msg.payload === "%E3%81%82%E3%81%84%E3%81%86%E3%81%88%E3%81%8A",
      true
    );
    const node2 = InitCommand(
      "convert",
      "decodeURIComponent/%E3%81%82%E3%81%84%E3%81%86%E3%81%88%E3%81%8A"
    );
    msg = await CallCommand(node2, msg);
    assert.equal(msg.payload === "あいうえお", true);
  });

  it("poweroff", async function () {
    const node = InitCommand("poweroff", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("reboot", async function () {
    const node = InitCommand("reboot", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("save", async function () {
    const node = InitCommand("save", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("load", async function () {
    const node = InitCommand("load", "");
    node.flow = {
      request: () => {
        return {};
      },
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("slide", async function () {
    const node = InitCommand("slide", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });
});

describe("dora/modules/http", function () {
  beforeAll(function () {
    jest.spyOn(console, "log").mockImplementation(x => {});
  });
  afterAll(function () {
    jest.restoreAllMocks();
  });

  it("post", async function () {
    const node = InitCommand("http.post", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("get", async function () {
    const node = InitCommand("http.get", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("credential.post", async function () {
    const node = InitCommand("http.credential.post", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("error", async function () {
    const node = InitCommand("http.error", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });
});

describe("dora/modules/led", function () {
  beforeAll(function () {
    jest.spyOn(console, "log").mockImplementation(x => {});
  });
  afterAll(function () {
    jest.restoreAllMocks();
  });

  it("on", async function () {
    const node = InitCommand("led.on", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("off", async function () {
    const node = InitCommand("led.off", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("blink", async function () {
    const node = InitCommand("led.blink", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("auto", async function () {
    const node = InitCommand("led.auto", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("talk", async function () {
    const node = InitCommand("led.talk", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });
});

describe("dora/modules/quiz", function () {
  beforeAll(function () {
    jest.spyOn(console, "log").mockImplementation(x => {});
  });
  afterAll(function () {
    jest.restoreAllMocks();
  });

  it("greeting", async function () {
    const node = InitCommand("quiz.greeting", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("entry", async function () {
    const node = InitCommand("quiz.entry", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("title", async function () {
    const node = InitCommand("quiz.title", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("slideURL", async function () {
    const node = InitCommand("quiz.slideURL", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("slide", async function () {
    const node = InitCommand("quiz.slide", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("edit", async function () {
    const node = InitCommand("quiz.edit", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("preload", async function () {
    const node = InitCommand("quiz.preload", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("startScreen", async function () {
    const node = InitCommand("quiz.startScreen", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("init", async function () {
    const node = InitCommand("quiz.init", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("id", async function () {
    const node = InitCommand("quiz.id", "hoge");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("shuffle", async function () {
    const node = InitCommand("quiz.shuffle", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("timeLimit", async function () {
    const node = InitCommand("quiz.timeLimit", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("select", async function () {
    const node = InitCommand("quiz.select", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("select.layout", async function () {
    const node = InitCommand("quiz.select.layout", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("answer", async function () {
    const node = InitCommand("quiz.answer", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("ok", async function () {
    const node = InitCommand("quiz.ok", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("ok.image", async function () {
    const node = InitCommand("quiz.ok.image", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("ng", async function () {
    const node = InitCommand("quiz.ng", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("ng.image", async function () {
    const node = InitCommand("quiz.ng.image", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("option.fontScale", async function () {
    const node = InitCommand("quiz.option.fontScale", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("option.marginTop", async function () {
    const node = InitCommand("quiz.option.marginTop", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("option.reset", async function () {
    const node = InitCommand("quiz.option.reset", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("optionButton", async function () {
    const node = InitCommand("quiz.optionButton", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("optionImageButton", async function () {
    const node = InitCommand("quiz.optionImageButton", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("sideImage", async function () {
    const node = InitCommand("quiz.sideImage", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("image", async function () {
    const node = InitCommand("quiz.image", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("messagePage", async function () {
    const node = InitCommand("quiz.messagePage", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("slidePage", async function () {
    const node = InitCommand("quiz.slidePage", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("show", async function () {
    const node = InitCommand("quiz.show", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("open", async function () {
    const node = InitCommand("quiz.open", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("yesno", async function () {
    const node = InitCommand("quiz.yesno", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("quizPage", async function () {
    const node = InitCommand("quiz.quizPage", "");
    let msg = {
      payload: {
        quiz: {
          question: "question",
          choices: [],
          answers: [],
        },
      },
    };
    msg = await CallCommand(node, msg);
  });

  it("lastPage", async function () {
    const node = InitCommand("quiz.lastPage", "");
    let msg = {
      payload: {
        quiz: {
          question: "question",
          choices: [],
          answers: [],
        },
      },
    };
    msg = await CallCommand(node, msg);
  });

  it("wait", async function () {
    const node = InitCommand("quiz.wait", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("start", async function () {
    const node = InitCommand("quiz.start", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("timeCheck", async function () {
    const node = InitCommand("quiz.timeCheck", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("stop", async function () {
    const node = InitCommand("quiz.stop", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("result", async function () {
    const node = InitCommand("quiz.result", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("ranking", async function () {
    const node = InitCommand("quiz.ranking", "");
    node.flow = {
      request: () => {
        return new Promise(resolved => {
          resolved([]);
        });
      },
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("answerCheck", async function () {
    const node = InitCommand("quiz.answerCheck", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("totalCount", async function () {
    const node = InitCommand("quiz.totalCount", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("message.open", async function () {
    const node = InitCommand("quiz.message.open", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("message.title", async function () {
    const node = InitCommand("quiz.message.title", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("message.content", async function () {
    const node = InitCommand("quiz.message.content", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("message.url", async function () {
    const node = InitCommand("quiz.message.url", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("message.link", async function () {
    const node = InitCommand("quiz.message.link", "");
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("message", async function () {
    const node = InitCommand("quiz.message", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("movie.play", async function () {
    const node = InitCommand("quiz.movie.play", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("movie.check", async function () {
    const node = InitCommand("quiz.movie.check", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("movie.cancel", async function () {
    const node = InitCommand("quiz.movie.cancel", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });

  it("speech", async function () {
    const node = InitCommand("quiz.speech", "");
    node.flow = {
      request: () => {},
    };
    let msg = {};
    msg = await CallCommand(node, msg);
  });
});
