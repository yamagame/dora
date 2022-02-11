const utils = require("../libs/utils");
const fetch = require("node-fetch");
const uuidv4 = require("uuid/v4");
const rgba = require("color-rgba");

const defaultBarData = {
  width: 24,
  height: 24,
  rgba: "#00FF00FF",
  type: "roundrect",
  info: {
    readOnly: false,
  },
};

const unit = 24;
const unitScale = 60 * 60 * 1000;

function today() {
  const date = new Date();
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return new Date(y, m, d);
}

function dayPosition(millisecond) {
  return parseInt(millisecond / unitScale);
}

function normalizeBarData(bar, uuid) {
  let t = {};
  if (typeof bar === "object") {
    t = { ...bar };
  }
  if (!t.uuid) {
    if (uuid) {
      t.uuid = uuid;
    } else {
      t.uuid = uuidv4();
    }
  }
  if (uuid) return t;
  if (typeof t.x === "undefined") {
    t.x = dayPosition(today().getTime());
  }
  if (typeof t.y === "undefined") {
    t.y = "auto";
  }
  Object.keys(defaultBarData).forEach(key => {
    if (typeof t[key] === "undefined") {
      t[key] = defaultBarData[key];
    }
  });
  return t;
}

module.exports = function (DORA, config) {
  /*
   *
   *
   */
  function barCreate(type) {
    return function (node, options) {
      var isTemplated = (options || "").indexOf("{{") != -1;
      node.on("input", async function (msg) {
        const barData = (function () {
          if (type === "create") {
            var title =
              options || (typeof msg.bar !== "object" ? null : msg.bar.title);
            if (isTemplated && title) {
              title = utils.mustache.render(title, msg);
            }
            const data = normalizeBarData(msg.bar);
            data.title = title;
            return data;
          } else {
            var uuid =
              options || (typeof msg.bar !== "object" ? null : msg.bar.uuid);
            if (isTemplated && uuid) {
              uuid = utils.mustache.render(uuid, msg);
            }
            const data = { ...msg.bar, uuid };
            return data;
          }
        })();
        var headers = {};
        headers["Content-Type"] = "application/json";
        let response = await fetch(
          `http://${msg.dora.host}:${msg.dora.port}/bar/update`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              barData: [{ ...barData }],
              create: type === "create" ? true : false,
              ...this.credential(),
            }),
          }
        );
        if (response.ok) {
          var contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const d = await response.json();
            if (d.bars.length > 0) {
              msg.bar = { ...d.bars[0], status: d.status };
            } else {
              msg.bar = { status: d.status };
            }
          } else {
            console.log("ERROR");
          }
        } else {
          console.log("ERROR");
        }
        node.send(msg);
      });
    };
  }
  DORA.registerType("create", barCreate("create"));
  DORA.registerType("update", barCreate("update"));

  /*
   *
   *
   */
  function barReset(node, options) {
    node.on("input", async function (msg) {
      delete msg.bar;
      node.send(msg);
    });
  }
  DORA.registerType("reset", barReset);

  /*
   *
   *
   */
  function barTime(node, options) {
    var isTemplated = (options || "").indexOf("{{") != -1;
    node.on("input", async function (msg) {
      let time = options || null;
      if (isTemplated && time) {
        time = utils.mustache.render(time, msg);
      }
      function getTime(time) {
        if (time === null) {
          return dayPosition(today().getTime());
        }
        return dayPosition(new Date(time).getTime());
      }
      if (!msg.bar) msg.bar = {};
      if (time) {
        msg.bar.x = getTime(time);
      } else {
        delete msg.bar.x;
      }
      node.send(msg);
    });
  }
  DORA.registerType("time", barTime);

  /*
   *
   *
   */
  function barToday(node, options) {
    node.on("input", async function (msg) {
      const d = dayPosition(today().getTime());
      if (!msg.bar) msg.bar = {};
      msg.bar.x = d;
      node.send(msg);
    });
  }
  DORA.registerType("today", barToday);

  /*
   *
   *
   */
  function barTitle(node, options) {
    var isTemplated = (options || "").indexOf("{{") != -1;
    node.on("input", async function (msg) {
      let title = options || null;
      if (isTemplated && title) {
        title = utils.mustache.render(title, msg);
      }
      if (title) {
        try {
          if (!msg.bar) msg.bar = {};
          msg.bar.title = title;
        } catch (err) {
          console.log(err);
        }
      }
      node.send(msg);
    });
  }
  DORA.registerType("title", barTitle);

  /*
   *
   *
   */
  function barWidth(node, options) {
    var isTemplated = (options || "").indexOf("{{") != -1;
    node.on("input", async function (msg) {
      let width = parseInt(options) || 1;
      if (isTemplated && width) {
        width = utils.mustache.render(width, msg);
      }
      if (width >= 1) {
        if (!msg.bar) msg.bar = {};
        msg.bar.width = width * 24;
        node.send(msg);
      } else {
        node.err(new Error("バーの長さは１以上の整数です。"));
      }
    });
  }
  DORA.registerType("width", barWidth);

  /*
   *
   *
   */
  function barText(node, options) {
    var isTemplated = (options || "").indexOf("{{") != -1;
    node.on("input", async function (msg) {
      let text = options || "";
      if (isTemplated && text) {
        text = utils.mustache.render(text, msg);
      }
      if (!msg.bar) msg.bar = {};
      msg.bar.text = text;
      node.send(msg);
    });
  }
  DORA.registerType("text", barText);

  /*
   *
   *
   */
  function barColor(node, options) {
    var isTemplated = (options || "").indexOf("{{") != -1;
    node.on("input", async function (msg) {
      let color = options || "";
      if (isTemplated && color) {
        color = utils.mustache.render(color, msg);
      }
      if (!msg.bar) msg.bar = {};
      const c = rgba(color);
      if (c) {
        function toHex(v) {
          return ("00" + v.toString(16)).slice(-2).toUpperCase();
        }
        msg.bar.rgba = `#${toHex(c[0])}${toHex(c[1])}${toHex(c[2])}${toHex(
          parseInt(c[3] * 0xff)
        )}`;
      }
      node.send(msg);
    });
  }
  DORA.registerType("color", barColor);

  /*
   *
   *
   */
  function barFind(type, mode) {
    return function (node, options) {
      const params = options.split("/:");
      var string = params[0];
      var isTemplated = (string || "").indexOf("{{") != -1;
      const pLen = params.length;
      if (params.length > 1) {
        node.nextLabel(`:${params.slice(1).join("/:")}`);
      }
      node.on("input", async function (msg) {
        const { socket } = node.flow.options;
        let exist = false;
        if (!msg.bar) msg.bar = {};
        let title = string || msg.bar.title;
        if (isTemplated && title) {
          title = utils.mustache.render(title, msg);
        }
        var params = {
          x: msg.bar.x,
          title,
        };
        if (type === "title") delete params.x;
        if (type === "time") delete params.title;
        if (type === "now") {
          delete params.x;
          params.x = dayPosition(today().getTime());
        }
        var headers = {};
        headers["Content-Type"] = "application/json";
        let response = await fetch(
          `http://${msg.dora.host}:${msg.dora.port}/bar/findOne`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              ...params,
              ...this.credential(),
            }),
          }
        );
        if (response.ok) {
          var contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            msg.bar = await response.json();
            if (mode === "eval" && msg.bar.status === "found") {
              eval(`(function(msg) { ${msg.bar.text} })(msg)`);
            }
            if (msg.bar.status === "found") {
              exist = true;
            }
          } else {
            console.log("ERROR");
            utils.logMessage(node, socket, "ERROR");
          }
        } else {
          console.log("ERROR");
          utils.logMessage(node, socket, "ERROR");
        }
        if (!exist && pLen > 1) {
          node.jump(msg);
        } else {
          node.next(msg);
        }
      });
    };
  }
  DORA.registerType("find", barFind(null));
  DORA.registerType("find.title", barFind("title"));
  DORA.registerType("find.time", barFind("time"));
  DORA.registerType("find.now", barFind("now"));
  DORA.registerType("eval", barFind(null, "eval"));
  DORA.registerType("eval.title", barFind("title", "eval"));
  DORA.registerType("eval.time", barFind("time", "eval"));
  DORA.registerType("eval.now", barFind("now", "eval"));

  /*
   *
   *
   */
  function barDelete(node, options) {
    var isTemplated = (options || "").indexOf("{{") != -1;
    node.on("input", async function (msg) {
      var uuid = options || (typeof msg.bar !== "object" ? null : msg.bar.uuid);
      if (uuid) {
        if (isTemplated) {
          uuid = utils.mustache.render(uuid, msg);
        }
        var headers = {};
        headers["Content-Type"] = "application/json";
        let response = await fetch(
          `http://${msg.dora.host}:${msg.dora.port}/bar/delete`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              barData: [{ uuid }],
              ...this.credential(),
            }),
          }
        );
        if (response.ok) {
          var contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            //
          }
        }
      }
      node.send(msg);
    });
  }
  DORA.registerType("delete", barDelete);

  /*
   *
   *
   */
  function barMoveScreen(node, options) {
    var isTemplated = (options || "").indexOf("{{") != -1;
    node.on("input", async function (msg) {
      var uuid = options || (typeof msg.bar !== "object" ? null : msg.bar.uuid);
      if (uuid) {
        if (isTemplated) {
          uuid = utils.mustache.render(uuid, msg);
        }
        var params = {
          ...this.credential(),
        };
        function DayToString(d) {
          return `${d.getFullYear()}-${("00" + (d.getMonth() + 1)).slice(
            -2
          )}-${("00" + d.getDate()).slice(-2)}`;
        }
        if (uuid === "today") {
          params.time = DayToString(today());
        } else {
          const d = new Date(uuid);
          if (d.toString() === "Invalid Date") {
            params.uuid = uuid;
          } else {
            params.time = DayToString(d);
          }
        }
        var headers = {};
        headers["Content-Type"] = "application/json";
        let response = await fetch(
          `http://${msg.dora.host}:${msg.dora.port}/bar/move-screen`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(params),
          }
        );
        if (response.ok) {
          var contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            //
          }
        }
      }
      node.send(msg);
    });
  }
  DORA.registerType("move.screen", barMoveScreen);
};
