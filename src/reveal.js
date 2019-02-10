'use strict';

import { Interval } from './interval';

function animate(e) {
  e.style.visibility = 'visible';
  return e.animate({ transform: ['translateY(20px) scale(.9)', 'translateY(0) scale(1)'], opacity: [0, 1] }, { duration: 500, easing: 'ease-out' });
}

const ival = new Interval(200);
const stack = [];
(observer => document.querySelectorAll('[reveal]').forEach(e => observer.observe(e)))(new IntersectionObserver((entries, obs) => entries.forEach(({ isIntersecting: reveal, target }) => {
  if (reveal) {
    obs.unobserve(target);
    stack.push(target);
    ival.do(() => (e => e ? animate(e) : ival.stop())(stack.shift()));
  }
}), { rootMargin: '0px', threshold: 0.15 }));
