export class Interval {
  constructor(interval) {
    this.interval = interval || 3000;
  }

  do(task) {
    this.task = task;
    window.requestAnimationFrame(this._doLater.bind(this));
    return this;
  }

  stop() {
    this.stoppped = true;
  }

  _doLater(timestamp) {
    if (this.stoppped) {
      return;
    }

    if (typeof this.lastTrigger === 'undefined' || timestamp - this.lastTrigger >= this.interval) {
      this.lastTrigger = timestamp;
      this.task();
    }

    window.requestAnimationFrame(this._doLater.bind(this));
  }
}
