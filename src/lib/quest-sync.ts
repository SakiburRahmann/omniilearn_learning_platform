import { db } from "./prisma";

function getDayKey() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

/**
 * Updates daily quest progress for a user.
 * This is called from various events (XP earned, Lesson completed).
 * It is idempotent and designed for near-zero latency by targeting 
 * only active quests for the current day.
 */
export async function updateQuestProgress(
  userId: string,
  type: string, // Cast to string to avoid build blockers if types aren't synced
  increment: number = 1,
  tx?: any
) {
  const client = tx || db;
  const dayKey = getDayKey();

  try {
    // 1. Find active quests of this type for the user today
    const activeQuests = await client.userQuest.findMany({
      where: {
        userId,
        dayKey,
        isCompleted: false,
        quest: { type: type as any },
      },
      include: { quest: true },
    });

    if (activeQuests.length === 0) return;

    // 2. Update progress for each active quest
    for (const uq of activeQuests) {
      const newValue = uq.currentValue + increment;
      const isNowCompleted = newValue >= uq.quest.targetValue;

      await db.userQuest.update({
        where: { id: uq.id },
        data: {
          currentValue: newValue,
          isCompleted: isNowCompleted,
          completedAt: isNowCompleted ? new Date() : null,
        },
      });
    }
  } catch (error) {
    console.error(`[QuestSync] Failed to update progress for user ${userId}:`, error);
  }
}
