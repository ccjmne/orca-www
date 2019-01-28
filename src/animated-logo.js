'use strict';

import anime from 'animejs';

const svgns = 'http://www.w3.org/2000/svg',
  selector = 'svg.animated-logo',
  svg = document.querySelector(selector),
  strokes = `${ selector } path[animate-stroke]`,
  fills = `${ selector } path[animate-fill]`,
  duration = 2000,
  easing = 'easeInOutQuad',
  shine = svg.querySelector('rect.shine');

const shiner = { shine: function () { this._ = this._ || anime({ targets: shine, x: [-125, 540], duration: 800, easing }).finished.then(() => this._ = false); } };
const defaults = { delay: e => e.getAttribute('delay'), duration: e => duration - parseInt(e.getAttribute('delay')) + 1000, easing };

const circles = [].slice.call(svg.querySelectorAll(strokes)).map(s => {
  const c = s.parentNode.appendChild(document.createElementNS(svgns, 'circle'));
  c.setAttribute('colour', s.getAttribute('colour'));
  c.setAttribute('delay', s.getAttribute('delay'));
  c.setAttribute('radius', s.getAttribute('radius') || 3);
  return Object.assign(c, { pathExtractor: anime.path(s) });
});

svg.addEventListener('mouseenter', shiner.shine);
svg.addEventListener('touchstart', shiner.shine);

anime({ targets: circles, ...defaults, r: c => [0, c.getAttribute('radius')], duration: 500 })
  .finished.then(() => anime({ targets: circles, r: c => [c.getAttribute('radius'), 0], easing, duration: 500, delay: 300 }));
anime({
  targets: circles,
  ...defaults,
  translateX: c => c.pathExtractor('x'),
  translateY: c => c.pathExtractor('y')
}).finished.then(() => anime({ targets: strokes, 'stroke-opacity': '0', duration: 1000, easing })).then(() => shiner.shine());
anime({ targets: fills, 'fill-opacity': [0, 1], easing, duration, delay: duration });
anime({ targets: strokes, ...defaults, strokeDashoffset: [anime.setDashoffset, 0] });
svg.style.visibility = 'visible';
