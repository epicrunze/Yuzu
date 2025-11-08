/**
 * Confetti Animation for Yuzu
 * 
 * Triggers celebration animation when papers are superliked
 * Uses canvas-confetti library
 */

import confetti from 'canvas-confetti';

export function triggerSuperlikeConfetti() {
  // Yuzu-themed confetti colors
  const colors = ['#FFB800', '#FFC94D', '#FFE8B3', '#10B981'];

  // Fire from center-bottom
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6, x: 0.5 },
    colors: colors,
    ticks: 200,
    gravity: 1.2,
    scalar: 1.2,
    drift: 0,
  });

  // Secondary burst for extra celebration
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: colors,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: colors,
    });
  }, 150);
}

export function triggerFirstSuperlikeConfetti() {
  // Extra special confetti for first save
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#FFB800', '#FFC94D'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#FFB800', '#FFC94D'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

