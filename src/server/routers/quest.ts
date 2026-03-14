import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { ensureUserSynced } from "@/lib/user-sync";

function getDayKey(): string {
  const d = new Date();
  return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

export const questRouter = createTRPCRouter({
  /**
   * Fetch daily quests for the current user.
   * If none exist for today, assigns from the template pool.
   * Optimized: single ensureUserSynced call, selective field fetching.
   */
  getDailyQuests: protectedProcedure.query(async ({ ctx }) => {
    const user = await ensureUserSynced(ctx.user);
    const userId = user.id;
    const dayKey = getDayKey();

    // 1. Fetch user quests for today with selective fields
    let userQuests = await db.userQuest.findMany({
      where: { userId, dayKey },
      include: {
        quest: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            targetValue: true,
            xpReward: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // 2. If no quests for today, assign from templates
    if (userQuests.length === 0) {
      const templates = await db.dailyQuest.findMany({
        take: 3,
        select: { id: true },
      });

      if (templates.length > 0) {
        await db.userQuest.createMany({
          data: templates.map((q: { id: string }) => ({
            userId,
            questId: q.id,
            dayKey,
            currentValue: 0,
            isCompleted: false,
          })),
          skipDuplicates: true,
        });

        userQuests = await db.userQuest.findMany({
          where: { userId, dayKey },
          include: {
            quest: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                targetValue: true,
                xpReward: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        });
      }
    }

    return userQuests;
  }),

  /**
   * Claim reward for a completed quest.
   * Atomic transaction: mark claimed → increment XP → log event.
   */
  claimReward: protectedProcedure
    .input(z.object({ userQuestId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ensureUserSynced(ctx.user);
      const userId = user.id;

      return await db.$transaction(async (tx) => {
        const userQuest = await tx.userQuest.findUnique({
          where: { id: input.userQuestId },
          include: { quest: { select: { xpReward: true } } },
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

        const xpAmount = userQuest.quest.xpReward;

        // Parallel: mark claimed + increment XP + log event
        await Promise.all([
          tx.userQuest.update({
            where: { id: input.userQuestId },
            data: { isClaimed: true },
          }),
          tx.studentProfile.update({
            where: { userId },
            data: { totalXp: { increment: xpAmount } },
          }),
          tx.xpEvent.create({
            data: {
              userId,
              amount: xpAmount,
              reason: "QUEST_REWARD",
              referenceId: userQuest.id,
            },
          }),
        ]);

        return { success: true, xpEarned: xpAmount };
      });
    }),
});
