'use strict';

import './pushstate-anchor';
import { menu } from '../menu';

export class Router {
  constructor(selector) {
    this.root = document.querySelector(selector);
    window.addEventListener('popstate', () => this._loadPage(), { passive: true, useCapture: false });
    this._loadPage();
  }

  onLoad(hook) {
    this.hook = hook;
    return this;
  }

  async _loadPage() {
    const { html, hook: pageHook } = await import( /* webpackChunkName: 'partials/[request]' */ `../views/${ window.location.pathname.substr(1) || 'home' }.js`);
    this.root.innerHTML = html;
    menu.close();
    if (typeof pageHook === 'function') {
      pageHook(this.root);
    }
    if (typeof this.hook === 'function') {
      this.hook(this.root);
    }
  }
}
