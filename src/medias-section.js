'use strict';

import anime from 'animejs';

// rotating certification cards
const freezeDuration = 5000;
anime({
  targets: '.rotating-card',
  keyframes: [{
      translateX: ['50%', '0'],
      rotateY: ['90deg', '0'],
      opacity: [0, 1],
      easing: 'easeOutCubic',
      duration: freezeDuration / 8
    },
    { duration: freezeDuration },
    {
      translateX: ['0', '-50%'],
      rotateY: ['0', '-90deg'],
      opacity: [1, 0],
      easing: 'easeInBack',
      duration: freezeDuration / 8
    }
  ],
  delay: anime.stagger(1.25 * freezeDuration),
  loop: true
});

// morphing pdf report
const px = v => `${ Math.round(v / 1.5) }px`;
const pdf = document.querySelector('#pdf'),
  dimensions = document.querySelector('#pdf #dimensions'),
  orientation = document.querySelector('#pdf #orientation'),
  duration = 500;

anime.timeline({ targets: pdf, duration, easing: 'easeInOutCubic', loop: true, delay: 3000 })
  .add({ width: px(297), height: px(420), changeBegin: () => anime({ targets: dimensions, opacity: [0, 1], duration, easing: 'linear', begin: () => dimensions.textContent = 'A3' }) })
  .add({ width: px(420), height: px(297), changeBegin: () => anime({ targets: orientation, opacity: [0, 1], duration, easing: 'linear', begin: () => (pdf.classList.add('landscape'), orientation.textContent = 'paysage') }) })
  .add({ width: px(297), height: px(210), changeBegin: () => anime({ targets: dimensions, opacity: [0, 1], duration, easing: 'linear', begin: () => dimensions.textContent = 'A4' }) })
  .add({ width: px(210), height: px(297), changeBegin: () => anime({ targets: orientation, opacity: [0, 1], duration, easing: 'linear', begin: () => (pdf.classList.remove('landscape'), orientation.textContent = 'portrait') }) });
