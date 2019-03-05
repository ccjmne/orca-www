'use strict';

import anime from 'animejs';
import { Interval, OnScreen } from '../../utils';

import './medias.scss';
import './prevention.scss';
import './values.scss';
export { default as html } from './home.html';
export function hook(root) {
  // rotating cards
  root.querySelectorAll('.rotating-cards-container').forEach(container => {
    const [flip, scan] = [350, 4000];
    const loop = anime.timeline({ targets: container.querySelectorAll('.rotating-card'), loop: true, delay: anime.stagger(scan + 2 * flip), autoplay: false })
      .add({ keyframes: [{ rotateY: ['90deg', '0'], opacity: [0, 1], easing: 'easeOutCubic', duration: flip }, { duration: scan }, { rotateY: ['0', '-90deg'], opacity: [1, 0], easing: 'easeInBack', duration: flip }] });
    if (container.matches('.scanning-cards-container')) {
      loop.add({ targets: container.querySelectorAll('.rotating-card.scanning-card > img'), keyframes: [{}, { top: [0, '100%'], translateY: [0, '-100%'] }, {}], easing: 'easeInOutCubic', duration: scan }, flip);
    }

    new OnScreen(container, { enter: loop.play, leave: loop.pause });
  });

  // pdf report
  const px = v => `${ Math.round(v / 1.5) }px`;
  const [morph, pdf, dimensions, orientation] = [500, root.querySelector('#pdf'), root.querySelector('#pdf #dimensions'), root.querySelector('#pdf #orientation')];
  (loop => new OnScreen(pdf, { enter: loop.play, leave: loop.pause }))(anime.timeline({ targets: pdf, duration: morph, easing: 'easeInOutCubic', loop: true, delay: 3000, autoplay: false })
    .add({ width: px(297), height: px(420), changeBegin: () => anime({ targets: dimensions, opacity: [0, 1], duration: morph, easing: 'linear', begin: () => dimensions.textContent = 'A3' }) })
    .add({ width: px(420), height: px(297), changeBegin: () => anime({ targets: orientation, opacity: [0, 1], duration: morph, easing: 'linear', begin: () => (pdf.classList.add('landscape'), orientation.textContent = 'paysage') }) })
    .add({ width: px(297), height: px(210), changeBegin: () => anime({ targets: dimensions, opacity: [0, 1], duration: morph, easing: 'linear', begin: () => dimensions.textContent = 'A4' }) })
    .add({ width: px(210), height: px(297), changeBegin: () => anime({ targets: orientation, opacity: [0, 1], duration: morph, easing: 'linear', begin: () => (pdf.classList.remove('landscape'), orientation.textContent = 'portrait') }) })
  );

  const chartSelector = 'svg#interactive-chart';
  new OnScreen(chartSelector, {
    once: true,
    threshold: 0,
    margin: '50%',
    enter: async function () {
      const { InteractiveChart } = await import( /* webpackChunkName: 'interactive-chart' */ './interactive-chart/interactive-chart');
      (([chart, interval]) => new OnScreen(chartSelector, {
        enter: () => interval.do(() => chart.displayNext()),
        leave: () => interval.stop()
      }))([new InteractiveChart(chartSelector), new Interval(4000)]);
    }
  });
}
