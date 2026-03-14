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
/**
 * Determines the current week key for league tracking (e.g., "2026-W11").
 * Uses ISO week numbering to ensure consistency across server/client.
 */
export function getCurrentWeekKey(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

export const LEAGUE_TIERS = [
  { id: 1, name: "Bronze", color: "#CD7F32" },
  { id: 2, name: "Silver", color: "#C0C0C0" },
  { id: 3, name: "Gold", color: "#FFD700" },
  { id: 4, name: "Sapphire", color: "#0F52BA" },
  { id: 5, name: "Ruby", color: "#E0115F" },
  { id: 6, name: "Emerald", color: "#50C878" },
  { id: 7, name: "Amethyst", color: "#9966CC" },
  { id: 8, name: "Pearl", color: "#EAE0C8" },
  { id: 9, name: "Obsidian", color: "#3B444B" },
  { id: 10, name: "Diamond", color: "#B9F2FF" },
];

export function getLeagueTierName(tier: number): string {
  return LEAGUE_TIERS.find(t => t.id === tier)?.name || "Bronze";
}
