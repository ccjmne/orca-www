'use strict';

import { OnScreen } from './utils';

new OnScreen('[reveal]', {
  once: true,
  enter: e => {
    e.style.visibility = 'visible';
    e.animate({ transform: ['translateY(20px) scale(.9)', 'translateY(0) scale(1)'], opacity: [0, 1] }, { duration: 500, easing: 'ease-out' });
  }
});

new OnScreen('img[data-src]:not([src])', {
  margin: '500px',
  threshold: 0,
  once: true,
  stagger: 0,
  enter: i => i.src = i.getAttribute('data-src')
});
