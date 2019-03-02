'use strict';

import { OnScreen } from '../utils';

window.customElements.define('main-heading', class MainHeading extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = require('./main-heading.html');
    (styling => (styling.textContent = require('!./main-heading.scss'), this.shadowRoot.prepend(styling)))(document.createElement('style'));
    new OnScreen(this, {
      once: true,
      threshold: 0,
      margin: '500px',
      stagger: 0,
      enter: () => (video => (video.setAttribute('src', video.getAttribute('data-src')), video.playbackRate = .6))(this.shadowRoot.querySelector('video[data-src]:not([src])'))
    });
  }
});
