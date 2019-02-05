'use strict';

import scrollReveal from 'scrollreveal';

const { reveal } = scrollReveal({
  duration: 500,
  distance: '20px',
  easing: 'ease-out',
  scale: .95,
  viewFactor: .3
});

reveal('[reveal]', { mobile: false, desktop: true, interval: 200, origin: 'bottom' });
reveal('[reveal]', { mobile: true, desktop: false, interval: 200, origin: 'right' });
