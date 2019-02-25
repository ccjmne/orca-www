'use strict';

import MicroModal from 'micromodal';
import anime from 'animejs';

export const api = {
  setActive(current) { this._current = current; },
  clearActive() { this._current = null; },
  close() { if (this._current) { MicroModal.close(); } }
};

const [wrapper, overlay, modals] = [document.querySelector('.outer-wrapper'), document.querySelector('.main > .overlay'), document.querySelector('.modals-container')];
document.querySelectorAll('[data-modal-trigger]').forEach(trigger => trigger.addEventListener('click', async function () {
  const modalId = this.getAttribute('data-modal-trigger');
  if (!modals.querySelector(`#${ modalId }`)) {
    const { 'default': modal } = await import( /* webpackChunkName: 'modals/[request]' */ `./${ modalId }.html`);
    modals.insertAdjacentHTML('beforeend', modal);
  }

  MicroModal.show(modalId, {
    awaitCloseAnimation: true,
    onShow: () => (api.setActive(modalId), anime.timeline({
      targets: wrapper,
      keyframes: [{ easing: 'easeInCubic', translateZ: '-50vw', rotateY: '25deg' }, { easing: 'easeOutBack', translateZ: '-100vw', rotateY: 0 }]
    }).add({ targets: overlay, opacity: .6, easing: 'easeInOutExpo' }, 0)),
    onClose: () => anime.timeline({
      targets: wrapper,
      keyframes: [{ easing: 'easeInCubic', translateZ: '-50vw', rotateY: '20deg' }, { easing: 'easeOutBack', translateZ: 0, rotateY: 0 }]
    }).add({ targets: overlay, opacity: 0, easing: 'easeInOutExpo' }, 0).finished.then(() => api.clearActive())
  });
}, { passive: true, useCapture: false }));
