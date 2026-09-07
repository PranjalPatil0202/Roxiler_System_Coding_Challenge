import confetti from 'canvas-confetti';

/**
 * Trigger a subtle, celebratory confetti burst from an element or screen center
 */
export const triggerSubtleConfetti = (originElement = null) => {
  let origin = { x: 0.5, y: 0.5 };

  if (originElement && originElement.getBoundingClientRect) {
    const rect = originElement.getBoundingClientRect();
    origin = {
      x: Math.max(0, Math.min(1, (rect.left + rect.width / 2) / window.innerWidth)),
      y: Math.max(0, Math.min(1, (rect.top + rect.height / 2) / window.innerHeight)),
    };
  }

  try {
    confetti({
      particleCount: 45,
      spread: 60,
      startVelocity: 26,
      origin,
      colors: ['#4F46E5', '#10B981', '#F59E0B', '#818CF8', '#EC4899'],
      ticks: 160,
      gravity: 1.1,
      scalar: 0.85,
      disableForReducedMotion: true,
    });
  } catch (err) {
    console.warn('Confetti animation skipped:', err);
  }
};
