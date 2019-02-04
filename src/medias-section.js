import anime from 'animejs';

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
