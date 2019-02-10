import Interval from './interval';

class OnScreen {
  constructor(selector, { once = false, enter, leave, threshold = .15, stagger = 200 }) {
    this.staggerIn = new Interval(stagger);
    this.staggerOut = new Interval(stagger);
    this.stackIn = [];
    this.stackOut = [];

    (observer => OnScreen._getElements(selector).forEach(e => observer.observe(e)))(new IntersectionObserver((entries, obs) => entries.forEach(({ isIntersecting: reveal, target }) => {
      if (reveal) {
        target.__onScreen = true;
        if (once) { obs.unobserve(target); }
        if (typeof enter === 'function') {
          this.stackIn.push(target);
          if (!this.staggerIn.running) { this.staggerIn.do(() => (e => e ? enter(e) : this.staggerIn.stop())(this.stackIn.shift())); }
        }
      } else if (target.__onScreen) {
        target.__onScreen = false;
        if (typeof leave === 'function') {
          this.stackOut.push(target);
          if (!this.staggerOut.running) { this.staggerOut.do(() => (e => e ? leave(e) : this.staggerOut.stop())(this.stackOut.shift())); }
        }
      }
    }), { rootMargin: '0px', threshold }));
  }

  static _getElements(selector) {
    if (selector instanceof Array) {
      return [].concat(...selector.map(s => OnScreen._getElements(s)));
    }

    if (selector instanceof Element) {
      return [selector];
    }

    return document.querySelectorAll(selector);
  }
}

export default OnScreen;
