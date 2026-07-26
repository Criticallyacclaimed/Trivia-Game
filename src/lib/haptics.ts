/**
 * Mobile Web Haptic Feedback Utility
 * Uses HTML5 navigator.vibrate API with fallback handling.
 */

export const triggerHaptic = (pattern: number | number[]) => {
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Suppress potential security or permission restriction errors
    }
  }
};

/**
 * Light tap feedback for general button presses and tab switches
 */
export const hapticLight = () => {
  triggerHaptic(15);
};

/**
 * Distinct double-pulse feedback for correct trivia answers
 */
export const hapticSuccess = () => {
  // Short pleasant double tap: 40ms buzz, 40ms pause, 60ms buzz
  triggerHaptic([40, 40, 60]);
};

/**
 * Warning pulse pattern for incorrect trivia answers
 */
export const hapticFailure = () => {
  // Heavy triple buzz warning pattern
  triggerHaptic([120, 60, 120, 60, 150]);
};

/**
 * Grand celebration pattern for quiz completion / match victory
 */
export const hapticVictory = () => {
  // Rhythmic festive pattern
  triggerHaptic([70, 40, 70, 40, 120, 60, 200]);
};
