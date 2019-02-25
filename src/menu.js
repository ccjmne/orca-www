'use strict';

import { api as modals } from './modals/modals';

const [menuToggle, hamburger] = [document.querySelector('.menu-toggle'), document.querySelector('.hamburger')];
menuToggle.addEventListener('click', () => {
  if (hamburger.classList.toggle('is-active', modals.getActive() !== 'modal-menu')) {
    return modals.open('modal-menu', { onClose: () => hamburger.classList.remove('is-active') });
  }

  modals.close();
}, { passive: true, useCapture: false });
