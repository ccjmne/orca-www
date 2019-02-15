'use strict';

import MicroModal from 'micromodal';
import anime from 'animejs';
import { menu } from '../menu';

const [wrapper, overlay, modals] = [document.querySelector('.main-wrapper'), document.querySelector('.main > .overlay'), document.querySelector('.modals-container')];
document.querySelectorAll('[data-modal-trigger]').forEach(trigger => trigger.addEventListener('click', async function () {
  menu.hide();
  const modalId = this.getAttribute('data-modal-trigger');
  if (!modals.querySelector(`#${ modalId }`)) {
    const { 'default': modal } = await import( /* webpackChunkName: 'modals/[request]' */ `./${ modalId }.html`);
    modals.insertAdjacentHTML('beforeend', modal);
  }

  MicroModal.show(modalId, {
    awaitCloseAnimation: true,
    onShow: () => anime.timeline({
      targets: wrapper,
      keyframes: [{ easing: 'easeInExpo', translateZ: -50, rotateY: '5deg' }, { easing: 'easeOutBack', translateZ: -200, rotateY: 0 }]
    }).add({ targets: overlay, opacity: .6, easing: 'easeInOutExpo' }, 0),
    onClose: () => anime.timeline({
      targets: wrapper,
      keyframes: [{ easing: 'easeInExpo', translateZ: -50, rotateY: '5deg' }, { easing: 'easeOutBack', translateZ: 0, rotateY: 0 }]
    }).add({ targets: overlay, opacity: 0, easing: 'easeInOutExpo' }, 0).finished.then(menu.show)
  });
}, { passive: true, useCapture: false }));
