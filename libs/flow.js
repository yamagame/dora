class Flow extends Array {
  constructor(engine, config){
    super();
    this.engine = engine;
    this.runnode = 0;
    this.running = false;
    this.execNodes = [];
    this.parentFlow = null;
  }

  run(node, msg) {
    this.running = true;
    this.engine.exec(this, node, msg);
    this.exec();
  }

  exec() {
    const t = [];
    for (var i=0;i<this.execNodes.length;i++) {
      t.push(this.execNodes[i]);
    }
    this.execNodes = [];
    for (var i=0;i<t.length;i++) {
      t[i].node.emit('input', t[i].msg);
    }
  }

  stop() {
    this.running = false;
  }

  send(node, msg) {
    this.engine.send(this, node, msg);
  }

  end(node, err, msg) {
    this.engine.end(this, node, err, msg);
  }

  up() {
    this.runnode ++;
  }

  down() {
    this.runnode --;
  }

  nextLabel(node, label) {
    return this.engine.nextLabel(node, label);
  }

  isRunning() {
    if (this.parentFlow) {
      return this.parentFlow.isRunning();
    }
    return this.running;
  }

  request(command, options, params) {
    if (this.parentFlow) {
      this.parentFlow.request(command, options, params);
    } else {
      this.engine.request(command, options, params);
    }
  }
}

module.exports = Flow;
