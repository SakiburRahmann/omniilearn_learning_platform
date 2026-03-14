import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { ensureUserSynced } from "@/lib/user-sync";

function getDayKey() {
  const d = new Date();
  return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

export const questRouter = createTRPCRouter({
  /**
   * Fetch daily quests for the current user.
   * If they don't exist for today, they are instantiated.
   */
  getDailyQuests: protectedProcedure.query(async ({ ctx }) => {
    const user = await ensureUserSynced(ctx.user);
    const userId = user.id;
    const dayKey = getDayKey();

    // 1. Fetch user quests for today
    let userQuests = await db.userQuest.findMany({
      where: { userId, dayKey },
      include: { quest: true },
    });

    // 2. If no quests for today, seed them from templates
    if (userQuests.length === 0) {
      const templates = await db.dailyQuest.findMany({
        take: 3, // For now just take the first 3
      });

      if (templates.length > 0) {
        // Atomic creation
        await db.userQuest.createMany({
          data: templates.map((q) => ({
            userId,
            questId: q.id,
            dayKey,
            currentValue: 0,
            isCompleted: false,
          })),
        });

        userQuests = await db.userQuest.findMany({
          where: { userId, dayKey },
          include: { quest: true },
        });
      }
    }

    return userQuests;
  }),

  /**
   * Claim reward for a completed quest.
   */
  claimReward: protectedProcedure
    .input(z.object({ userQuestId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ensureUserSynced(ctx.user);
      const userId = user.id;

      return await db.$transaction(async (tx) => {
        const userQuest = await tx.userQuest.findUnique({
          where: { id: input.userQuestId },
          include: { quest: true },
        });

        if (!userQuest || userQuest.userId !== userId) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Quest not found" });
        }

        if (!userQuest.isCompleted) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Quest not completed" });
        }

        if (userQuest.isClaimed) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Reward already claimed" });
        }

        // 1. Mark as claimed
        await tx.userQuest.update({
          where: { id: input.userQuestId },
          data: { isClaimed: true },
        });

        // 2. Update Profile XP
        const xpAmount = userQuest.quest.xpReward;
        await tx.studentProfile.update({
          where: { userId },
          data: { totalXp: { increment: xpAmount } },
        });

        // 3. Log XP Event
        await tx.xpEvent.create({
          data: {
            userId,
            amount: xpAmount,
            reason: "QUEST_REWARD",
            referenceId: userQuest.id,
          },
        });

        return { success: true, xpEarned: xpAmount };
      });
    }),
});
