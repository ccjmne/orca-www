'use strict';

window.customElements.define('pricing-card', class PricingCard extends HTMLElement {

  static get observedAttributes() {
    return ['bigger', 'labels-only'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = require('./pricing-card.html');
    (styling => (styling.textContent = require('!./pricing-card.scss'), this.shadowRoot.prepend(styling)))(document.createElement('style'));
    this.classList.toggle('bigger', !!this['bigger']); // jshint ignore: line
    this.classList.toggle('pricing-labels', !!this['labels-only']);
  }

  attributeChangedCallback(name, prev, value) {
    this[name] = value !== null && value !== 'false';
  }
});
