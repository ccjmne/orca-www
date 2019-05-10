'use strict';

import MicroModal from 'micromodal';
import anime from 'animejs';

const [wrapper, overlay, modals] = [document.querySelector('.outer-wrapper'), document.querySelector('.main > .overlay'), document.querySelector('.modals-container')];
export const api = {
  _setActive(current) { this._current = current; },
  _clearActive() { this._current = null; },
  hookUp(root = document) {
    root.querySelectorAll('[data-modal-trigger]').forEach(trigger => trigger.addEventListener('click', () => this.open(trigger.getAttribute('data-modal-trigger')), { passive: true, useCapture: false }));
  },
  getActive() { return this._current; },
  close() { if (this._current) { MicroModal.close(); } },
  async open(modalId, { onOpen, onClose, noBgAnimation } = {}) {
    if (!modals.querySelector(`#${ modalId }`)) {
      const { 'default': modal } = await import( /* webpackChunkName: 'modals/[request]' */ `./${ modalId }.html`);
      modals.insertAdjacentHTML('beforeend', modal);
    }

    MicroModal.show(modalId, {
      awaitCloseAnimation: true,
      onShow: () => {
        if (!noBgAnimation) {
          anime.timeline({
            targets: wrapper,
            keyframes: [{ easing: 'easeInCubic', translateZ: '-50vw', rotateY: '25deg' }, { easing: 'easeOutBack', translateZ: '-100vw', rotateY: 0 }]
          }).add({ targets: overlay, opacity: .6, easing: 'easeInOutExpo' }, 0);
        }

        api._setActive(modalId);
        if (typeof onOpen === 'function') {
          onOpen(modals.querySelector(`#${ modalId }`));
        }
      },
      onClose: () => {
        (noBgAnimation ? Promise.resolve() : anime.timeline({
          targets: wrapper,
          keyframes: [{ easing: 'easeInCubic', translateZ: '-50vw', rotateY: '20deg' }, { easing: 'easeOutBack', translateZ: 0, rotateY: 0 }]
        }).add({ targets: overlay, opacity: 0, easing: 'easeInOutExpo' }, 0).finished).then(() => api._clearActive());
        if (typeof onClose === 'function') {
          onClose(modals.querySelector(`#${ modalId }`));
        }
      }
    });
  }
};
