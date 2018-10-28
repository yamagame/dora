const utils = require('../libs/utils');

function ToNumber(v) {
  if (typeof v === 'string') {
    if (v.indexOf('.') >= 0) {
      v = parseFloat(Number(v));
    } else {
      v = parseInt(Number(v));
    }
  }
  return v;
}

function GetOption(options, isTemplated, msg) {
  let message = options;
  if (isTemplated) {
      message = utils.mustache.render(message, msg);
  }
  return message;
}

function Add(node, msg, options, isTemplated) {
  const value = ToNumber(GetOption(options, isTemplated, msg));
  msg.payload = ToNumber(msg.payload);
  msg.payload += value;
  node.send(msg);
}

function Sub(node, msg, options, isTemplated) {
  const value = ToNumber(GetOption(options, isTemplated, msg));
  msg.payload = ToNumber(msg.payload);
  msg.payload -= value;
  node.send(msg);
}

function Mul(node, msg, options, isTemplated) {
  const value = ToNumber(GetOption(options, isTemplated, msg));
  msg.payload = ToNumber(msg.payload);
  msg.payload *= value;
  node.send(msg);
}

function Div(node, msg, options, isTemplated) {
  const value = ToNumber(GetOption(options, isTemplated, msg));
  msg.payload = ToNumber(msg.payload);
  msg.payload /= value;
  node.send(msg);
}

function Inc(node, msg, options, isTemplated) {
  const value = GetOption(options, isTemplated, msg);
  if (value) {
    msg.payload = ToNumber(value);
  } else {
    msg.payload = ToNumber(msg.payload);
  }
  msg.payload ++;
  node.send(msg);
}

function Dec(node, msg, options, isTemplated) {
  const value = GetOption(options, isTemplated, msg);
  if (value) {
    msg.payload = ToNumber(value);
  } else {
    msg.payload = ToNumber(msg.payload);
  }
  msg.payload --;
  node.send(msg);
}

function Int(node, msg, options, isTemplated) {
  const value = GetOption(options, isTemplated, msg);
  if (value) {
    msg.payload = parseInt(Number(value));
  } else {
    msg.payload = parseInt(Number(msg.payload));
  }
  node.send(msg);
}

function Float(node, msg, options, isTemplated) {
  const value = GetOption(options, isTemplated, msg);
  if (value) {
    msg.payload = parseFloat(Number(value));
  } else {
    msg.payload = parseFloat(Number(msg.payload));
  }
  node.send(msg);
}

function Cmp(node, msg, options, isTemplated, ope) {
  const value = ToNumber(GetOption(options, isTemplated, msg));
  msg.payload = ToNumber(msg.payload);
  if (ope(msg.payload, value)) {
    node.send(msg);
  } else {
    node.next(msg);
  }
}

module.exports = function(DORA, config) {

  /*
   *
   *
   */
  function OpAdd(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      Add(node, msg, options, isTemplated);
    })
  }
  DORA.registerType('add', OpAdd);

  /*
   *
   *
   */
  function OpSub(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      Sub(node, msg, options, isTemplated);
    })
  }
  DORA.registerType('sub', OpSub);

  /*
   *
   *
   */
  function OpMul(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      Mul(node, msg, options, isTemplated);
    })
  }
  DORA.registerType('mul', OpMul);

  /*
   *
   *
   */
  function OpDiv(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      Div(node, msg, options, isTemplated);
    })
  }
  DORA.registerType('div', OpDiv);

  /*
   *
   *
   */
  function OpInc(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      Inc(node, msg, options, isTemplated);
    })
  }
  DORA.registerType('inc', OpInc);

  /*
   *
   *
   */
  function OpDec(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      Dec(node, msg, options, isTemplated);
    })
  }
  DORA.registerType('dec', OpDec);

  /*
   *
   *
   */
  function OpInt(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      Int(node, msg, options, isTemplated);
    })
  }
  DORA.registerType('toInt', OpInt);

  /*
   *
   *
   */
  function OpFloat(node, options) {
    var isTemplated = (options||"").indexOf("{{") != -1;
    node.on("input", async function(msg) {
      Float(node, msg, options, isTemplated);
    })
  }
  DORA.registerType('toFloat', OpFloat);

  /*
   *
   *
   */
  function OpCmp(ope) {
    return function (node, options) {
      var isTemplated = (options||"").indexOf("{{") != -1;
      node.nextLabel(options, 1);
      node.on("input", async function(msg) {
        const v = options.split('/');
        Cmp(node, msg, v[0], isTemplated, ope);
      })
    }
  }
  DORA.registerType('==', OpCmp((a, b) => {
    return a == b;
  }));
  DORA.registerType('!=', OpCmp((a, b) => {
    return a != b;
  }));
  DORA.registerType('>=', OpCmp((a, b) => {
    return a >= b;
  }));
  DORA.registerType('<=', OpCmp((a, b) => {
    return a <= b;
  }));
  DORA.registerType('>',  OpCmp((a, b) => {
    return a > b;
  }));
  DORA.registerType('<',  OpCmp((a, b) => {
    return a < b;
  }));

}
