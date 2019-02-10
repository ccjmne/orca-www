import Interval from './interval';

class OnScreen {
  constructor(selector, { once = false, enter, leave, threshold = .15, stagger = 200 }) {
    this.staggerIn = new Interval(stagger);
    this.staggerOut = new Interval(stagger);
    this.stackIn = [];
    this.stackOut = [];

    (observer => document.querySelectorAll(selector).forEach(e => observer.observe(e)))(new IntersectionObserver((entries, obs) => entries.forEach(({ isIntersecting: reveal, target }) => {
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
}

export default OnScreen;
