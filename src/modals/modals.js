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
      if (modalId === 'modal-contact-us') {
        const [form, submit, overlay] = [modals.querySelector('#modal-contact-us form'), modals.querySelector('#modal-contact-us form button[type=submit]'), modals.querySelector('#modal-contact-us form .spinner-overlay')];
        form.addEventListener('submit', event => {
          event.preventDefault();
          submit.disabled = true;
          overlay.style.visibility = 'visible';
          const { email: mail, name, company: org, message: body } = Object
            .values(form.elements)
            .filter(({ name }) => !!name)
            .reduce((acc, field) => ({ ...acc, [field.name]: field.value }), {});

          window.fetch(Object.assign(new URL('https://hxfg23lplg.execute-api.eu-west-1.amazonaws.com/Prod/GET_IN_TOUCH'), { search: new window.URLSearchParams({ name, mail, org }) }), {
            method: 'post',
            body
          }).then(() => {
            submit.disabled = false;
            overlay.style.visibility = 'hidden';
            api.close();
            api.open('modal-message-received', { noBgAnimation: true });
          }, () => {
            submit.disabled = false;
            overlay.style.visibility = 'hidden';
          });
        });
      }
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
