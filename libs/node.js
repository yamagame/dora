var Emitter = require('component-emitter');
const clone = require("clone");

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

  err(err) {
    this.flow.err(err);
  }

  fork(msg) {
    const w = [];
    for (var i=0;i<this.wires.length-1;i++) {
      delete msg.labels;
      const m = clone(msg);
      m.topic = this.wires[i].labelName;
      m.topicPriority = (typeof m.topicPriority !== 'undefined') ? m.topicPriority : 0;
      w.push(m);
    }
    w.push(null);
    this.send(w);
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
