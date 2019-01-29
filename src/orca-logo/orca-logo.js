'use strict';

import anime from 'animejs';

const svgns = 'http://www.w3.org/2000/svg';

class OrcaLogo extends HTMLElement {

  static get observedAttributes() {
    return ['animated'];
  }

  constructor() {
    super();
    this.innerHTML = require('./orca-logo.html');
    this.strokes = this.querySelectorAll('path[animate-stroke]');
    this.fills = this.querySelectorAll('path[animate-fill]');
    this.reflection = this.querySelector('rect.shine');
    this.circles = [].map.call(this.strokes, s => {
      const c = s.parentNode.appendChild(document.createElementNS(svgns, 'circle'));
      c.setAttribute('colour', s.getAttribute('colour'));
      c.setAttribute('delay', s.getAttribute('delay'));
      c.setAttribute('radius', s.getAttribute('radius') || 3);
      return Object.assign(c, { pathExtractor: anime.path(s) });
    });
  }

  shine() {
    if (!this.shining) {
      this.shining = anime({ targets: this.reflection, x: [-125, 540], duration: 800, easing: 'easeInOutQuad' }).finished.then(() => this.shining = false);
    }
  }

  // lifecycle hooks
  connectedCallback() {
    this.addEventListener('mouseenter', this.shine);
    this.addEventListener('touchstart', this.shine);

    if (this.animated) {
      const duration = 2000;
      const easing = 'easeInOutQuad';
      const defaults = { delay: e => e.getAttribute('delay'), duration: e => duration - parseInt(e.getAttribute('delay')) + 1000, easing };
      anime({ targets: this.strokes, ...defaults, strokeDashoffset: [anime.setDashoffset, 0] });
      anime({ targets: this.circles, ...defaults, r: c => [0, c.getAttribute('radius')], duration: 500 })
        .finished.then(() => anime({ targets: this.circles, r: c => [c.getAttribute('radius'), 0], easing, duration: 500, delay: 300 }));
      anime({ targets: this.circles, ...defaults, translateX: c => c.pathExtractor('x'), translateY: c => c.pathExtractor('y') })
        .finished.then(() => anime({ targets: this.strokes, 'stroke-opacity': '0', duration: 1000, easing })).then(() => this.shine());
      anime({ targets: this.fills, 'fill-opacity': [0, 1], easing, duration, delay: duration });
    }
  }

  get animated() {
    return this.getAttribute('animated') !== null && this.getAttribute('animated') !== 'false';
  }
}

window.customElements.define('orca-logo', OrcaLogo);
