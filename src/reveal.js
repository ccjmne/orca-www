'use strict';

import { OnScreen } from './utils';

export function reveal(container = document) {
  new OnScreen(container.querySelectorAll('[reveal]'), {
    once: true,
    enter: e => {
      e.style.visibility = 'visible';
      if (e.getAttribute('reveal') !== 'instantaneous') {
        e.animate({ transform: ['translateY(20px) scale(.9)', 'translateY(0) scale(1)'], opacity: [0, 1] }, { duration: 500, easing: 'ease-out' });
      }
    }
  });

  new OnScreen(container.querySelectorAll('img[data-src]:not([src])'), {
    once: true,
    threshold: 0,
    margin: '500px',
    stagger: 0,
    enter: i => i.src = i.getAttribute('data-src')
  });
}
