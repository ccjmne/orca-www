'use strict';

import anime from 'animejs';

const [hamburger, toggle, items, main, overlay, padding] = [
  document.querySelector('.hamburger'),
  document.querySelector('.menu-toggle'),
  document.querySelectorAll('.menu-items a'),
  document.querySelector('.main-wrapper'),
  document.querySelector('.overlay'),
  document.querySelector('.vertical-padding')
];

export class Menu {
  constructor() {
    this.isOpen = false;
    toggle.addEventListener('click', () => document.body.classList.contains('menu-open') ? this.close() : this.open(), { passive: true, useCapture: false });
    overlay.addEventListener('click', () => this.close(), { passive: true, useCapture: false });
  }

  open() {
    this.isOpen = true;
    anime.timeline({ targets: main, rotate: '-30deg', duration: 500, easing: 'easeInOutExpo', begin: () => (main.style.height = '200%', padding.style.display = 'block') })
      .add({ targets: overlay, opacity: .6 }, 0);
    anime.timeline({ targets: items, translateX: (e, idx) => [`${-40 + idx * 20}px`, `${idx * 20}px`], easing: 'easeOutBack', duration: 500, delay: anime.stagger(100, { start: 100 }) })
      .add({ targets: items, opacity: [0, 1], easing: 'easeInOutQuad' }, 0);
  }

  close() {
    this.isOpen = false;
    anime.timeline({ targets: main, rotate: '0deg', duration: 500, easing: 'easeInOutExpo' })
      .add({ targets: overlay, opacity: 0 }, 0)
      .finished.then(() => (main.style.height = '100%', padding.style.display = 'none'));
    anime({ targets: items, translateX: (e, idx) => [`${idx * 20}px`, `${-40 + idx * 20}px`], opacity: [1, 0], easing: 'easeOutExpo', duration: 500, delay: anime.stagger(100) });
  }

  get isOpen() {
    return this._isOpen;
  }

  set isOpen(value) {
    const { offsetHeight, scrollHeight } = main;
    main[this._isOpen = value ? 'addEventListener' : 'removeEventListener']('scroll', function asdf({ target: { scrollTop } })  {
      if (scrollTop > scrollHeight - offsetHeight + 2) { // 2px for border-top and bottom
        main.scrollTop = scrollHeight - offsetHeight + 2;
      }
    }, { passive: true, useCapture: false });
    document.body.classList[value ? 'add' : 'remove']('menu-open');
    hamburger.classList[value ? 'add' : 'remove']('is-active');
  }
}

export const menu = new Menu();
