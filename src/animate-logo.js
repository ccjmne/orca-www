'use strict';

const { 'default': anime } = require('animejs');

const svgns = 'http://www.w3.org/2000/svg',
  selector = '.hero svg.animated-logo',
  drawDuration = 2000,
  easing = 'easeInOutQuad',
  svg = document.querySelector(selector),
  shine = svg.querySelector('rect.shine');

const strokes = [].slice.call(document.querySelectorAll(`${ selector } path[stroke][delay]`)).map(s => {
  const c = document.createElementNS(svgns, 'circle');
  c.setAttribute('delay', s.getAttribute('delay'));
  c.setAttributeNS(null, 'fill', s.getAttribute('stroke'));
  c.setAttributeNS(null, 'radius', s.getAttribute('r') || 3);
  s.parentNode.appendChild(c);
  c.pathExtractor = anime.path(s);
  return c;
});

function doShine() {
  anime({ targets: shine, x: [-125, 540], duration: 800, easing });
}

setTimeout(() => {
  svg.style.visibility = 'visible';
  svg.addEventListener('mouseenter', doShine);
  svg.addEventListener('touchstart', doShine);
  anime({ targets: strokes, r: e => [0, e.getAttribute('radius')], duration: 500, easing, delay: e => e.getAttribute('delay') })
    .finished.then(() => anime({ targets: strokes, r: e => [e.getAttribute('radius'), 0], easing, duration: 500, delay: 300 }));
  anime({
    targets: strokes,
    translateX: x => x.pathExtractor('x'),
    translateY: x => x.pathExtractor('y'),
    duration: e => drawDuration - parseInt(e.getAttribute('delay')) + 1000,
    easing,
    delay: e => e.getAttribute('delay')
  }).finished.then(() => anime({ targets: `${ selector } path[stroke]`, 'stroke-opacity': '0', duration: 1000, easing })).then(doShine);
  anime({ targets: `${ selector } path[fill][fill-opacity='0']`, 'fill-opacity': [0, 1], easing, duration: 2000, delay: 2000 });
  anime({ targets: `${ selector } path[stroke]`, strokeDashoffset: [anime.setDashoffset, 0], duration: e => drawDuration - parseInt(e.getAttribute('delay')) + 1000, easing, delay: e => e.getAttribute('delay') });
}, 0);
