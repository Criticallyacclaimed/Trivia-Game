import confetti from 'canvas-confetti';

/**
 * Triggers a multi-stage canvas-based confetti celebration
 * when a user completes a trivia game or match.
 */
export const triggerCelebrationConfetti = (scoreRatio: number = 1) => {
  // Center initial burst
  confetti({
    particleCount: scoreRatio > 0.8 ? 100 : 60,
    spread: 100,
    startVelocity: 45,
    origin: { y: 0.6 },
    colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
    disableForReducedMotion: true,
  });

  // Left side cannon burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 70,
      origin: { x: 0.1, y: 0.65 },
      colors: ['#6366f1', '#a855f7', '#f43f5e', '#fbbf24'],
      disableForReducedMotion: true,
    });
  }, 250);

  // Right side cannon burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 70,
      origin: { x: 0.9, y: 0.65 },
      colors: ['#3b82f6', '#10b981', '#ec4899', '#f59e0b'],
      disableForReducedMotion: true,
    });
  }, 450);

  // Extra golden stars burst for high performers (80%+ score)
  if (scoreRatio >= 0.8) {
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 120,
        startVelocity: 35,
        ticks: 200,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#fbbf24', '#fef08a', '#d97706'],
        shapes: ['star'],
        disableForReducedMotion: true,
      });
    }, 700);
  }
};

/**
 * Quick celebratory burst for answer streaks
 */
export const triggerStreakConfetti = () => {
  confetti({
    particleCount: 40,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#f59e0b', '#ec4899', '#6366f1', '#10b981'],
    disableForReducedMotion: true,
  });
};

/**
 * Premium unlock shower
 */
export const triggerProUnlockConfetti = () => {
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#f59e0b', '#fbbf24', '#8b5cf6', '#ec4899'],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#f59e0b', '#fbbf24', '#8b5cf6', '#ec4899'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};
