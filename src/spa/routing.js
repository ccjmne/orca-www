'use strict';

import './pushstate-anchor';
import { api as modals } from '../modals/modals';
import anime from 'animejs';

export class Router {
  constructor(selector) {
    this.root = document.querySelector(selector);
    this.wrapper = document.querySelector('.main-wrapper');
    window.addEventListener('popstate', () => this._loadPage(), { passive: true, useCapture: false });
    this._loadPage();
  }

  onLoad(hook) {
    this.hook = hook;
    return this;
  }

  async _loadPage() {
    const view = window.location.pathname.substr(1) || 'home';
    const { html, hook: pageHook } = await import( /* webpackChunkName: 'partials/[request]' */ `../views/${ view }/${ view }.js`);
    // TODO: scroll to top
    anime.timeline({ targets: this.wrapper })
      .add({ rotateY: [0, '-90deg'], duration: 500, easing: 'easeInBack', changeComplete: () => this.root.innerHTML = html })
      .add({ rotateY: ['90deg', 0], duration: 300, easing: 'easeOutCubic' })
      .finished.then(() => {
        modals.close();
        if (typeof pageHook === 'function') {
          pageHook(this.root);
        }
        if (typeof this.hook === 'function') {
          this.hook(this.root);
        }
      });
  }
}
