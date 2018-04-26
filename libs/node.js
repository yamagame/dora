var Emitter = require('component-emitter');

class Node extends Emitter {
  constructor(flow){
    super();
    this.flow = flow;
    this.wires = [];
    this._act = 0;
    this.line = 0;
    this.reason = '';
  }

  global() {
    return this.flow.engine.global;
  }

  status(status) {
  }

  send(msg) {
    this.flow.send(this, msg);
  }

  jump(msg) {
    const w = [];
    for (var i=0;i<this.wires.length-1;i++) {
      w.push(msg);
    }
    w.push(null);
    this.send(w);
  }

  next(msg) {
    const w = [];
    for (var i=0;i<this.wires.length-1;i++) {
      w.push(null);
    }
    w.push(msg);
    this.send(w);
  }

  end(err, msg) {
    this.flow.end(this, err, msg);
  }

  up() {
    this._act ++;
  }

  down() {
    this._act --;
  }

  nextLabel(label) {
    return this.flow.nextLabel(this, label);
  }
}

module.exports = Node;
