// Extend the <a> tag with history.pushState()
// <a is="pushstate-anchor" href="/path" [title="New Page Title"] [state="{'message':'New State!'}"]>title</a>

class HTMLPushStateAnchorElement extends HTMLAnchorElement {
  connectedCallback() {
    this.addEventListener('click', this.eventListener, false);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.eventListener, false);
  }

  eventListener(event) {
    // open in new tab or open context menu (workaround for Firefox)
    if (event.ctrlKey || event.metaKey || event.which === 2 || event.which === 3) {
      return;
    }

    const href = this.getAttribute('href');
    if (!href || href.indexOf('http') === 0 && window.location.host !== new URL(href).host) {
      // don't pushState if the URL is for a different host
      return;
    }

    window.history.pushState(JSON.parse(this.getAttribute('state')) || window.history.state, this.getAttribute('title'), href);
    window.dispatchEvent(new window.PopStateEvent('popstate', { bubbles: false, cancelable: false, state: window.history.state }));
    event.preventDefault();
  }
}

window.customElements.define('pushstate-anchor', HTMLPushStateAnchorElement, { extends: 'a' });
