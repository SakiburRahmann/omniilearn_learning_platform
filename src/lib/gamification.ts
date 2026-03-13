/**
 * Industrial-Grade Gamification Engine
 * Handles Hearts, XP, and Streak logic with atomic consistency.
 */

export const HEART_REGEN_INTERVAL_HOURS = 4;
export const MAX_HEARTS = 5;

/**
 * Calculates current hearts based on time elapsed since last refill.
 * This provides a reliable "virtual" heart count without constant DB writes.
 */
export function calculateCurrentHearts(heartsCurrent: number, heartsLastRefill: Date): {
  current: number;
  nextRegenMs: number | null;
} {
  const now = new Date();
  const elapsedMs = now.getTime() - heartsLastRefill.getTime();
  const msInInterval = HEART_REGEN_INTERVAL_HOURS * 60 * 60 * 1000;
  
  const heartsToAdd = Math.floor(elapsedMs / msInInterval);
  
  const totalHearts = Math.min(MAX_HEARTS, heartsCurrent + heartsToAdd);
  
  let nextRegenMs = null;
  if (totalHearts < MAX_HEARTS) {
    const timeIntoCurrentHeart = elapsedMs % msInInterval;
    nextRegenMs = msInInterval - timeIntoCurrentHeart;
  }

  return {
    current: totalHearts,
    nextRegenMs
  };
}

/**
 * Determines the new streak count based on the last recorded activity.
 * Logic:
 * - If last updated TODAY: Keep current streak.
 * - If last updated YESTERDAY: Increment streak.
 * - Otherwise: Reset to 1 (new streak started today).
 */
export function calculateNewStreak(currentStreak: number, streakLastUpdated: Date | null): {
  newStreak: number;
  longestStreakUpdate?: number;
  shouldUpdate: boolean;
} {
  const now = new Date();
  // Use UTC dates for consistent server-side comparison
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  
  if (!streakLastUpdated) {
    return { newStreak: 1, shouldUpdate: true };
  }

  const lastUpdate = new Date(Date.UTC(
    streakLastUpdated.getUTCFullYear(),
    streakLastUpdated.getUTCMonth(),
    streakLastUpdated.getUTCDate()
  ));

  const diffMs = today.getTime() - lastUpdate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already updated today
    return { newStreak: currentStreak, shouldUpdate: false };
  } else if (diffDays === 1) {
    // Consecutive day
    return { newStreak: currentStreak + 1, shouldUpdate: true };
  } else {
    // Streak broken
    return { newStreak: 1, shouldUpdate: true };
  }
}
