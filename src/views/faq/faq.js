'use strict';

import './faq.scss';
export { default as html } from './faq.html';
export const onLoadOpts = { stagger: 100 };

export function hook(root) {
  [].map
    .call(root.querySelectorAll('[data-collapse]'), e => Object.assign(e, { card: e.parentNode, collapsible: e.parentNode.querySelector('.collapsible') }))
    .forEach(e => e.addEventListener('click', () => {
      if (e.classList.contains('collapser') || !e.card.classList.contains('open')) {
        e.collapsible.style.maxHeight = e.card.classList.toggle('open') ? `${ e.collapsible.scrollHeight }px` : 0;
      }
    }, { passive: true, useCapture: false }));
}
