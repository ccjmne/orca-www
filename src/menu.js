'use strict';

import { api as modals } from './modals/modals';
import anime from 'animejs';

const [menuToggle, hamburger] = [document.querySelector('.menu-toggle'), document.querySelector('.hamburger')];
menuToggle.addEventListener('click', () => {
  if (hamburger.classList.toggle('is-active', modals.getActive() !== 'modal-menu')) {
    return modals.open('modal-menu', {
      onOpen: root => anime({ targets: root.querySelectorAll('.menu-items > a'), translateX: [-50, 0], opacity: [0, 1], easing: 'easeOutBack', delay: anime.stagger(100, { start: 200 }), duration: 500 }),
      onClose: () => hamburger.classList.remove('is-active')
    });
  }

  modals.close();
}, { passive: true, useCapture: false });
