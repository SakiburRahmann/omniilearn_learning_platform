import { db } from "./prisma";
import { getCurrentWeekKey } from "./gamification";
import { Prisma } from "@prisma/client";

/**
 * Ensures a user is joined to a league group for the current week
 * and increments their XP in that group.
 * Must be called within a Prisma transaction for consistency.
 */
export async function syncUserLeagueXP(
  userId: string, 
  xpAmount: number, 
  tx: Prisma.TransactionClient
) {
  const weekKey = getCurrentWeekKey();

  // 1. Find the user's entry for this week
  let userLeague = await tx.userLeague.findFirst({
    where: { userId, weekKey },
    include: { leagueGroup: true }
  });

  // 2. If no entry, join a league group
  if (!userLeague) {
    // Determine tier based on the most recent previous entry
    const lastWeek = await tx.userLeague.findFirst({
      where: { userId },
      orderBy: { weekKey: 'desc' },
      include: { leagueGroup: true }
    });

    let tier = 1;
    if (lastWeek) {
      if (lastWeek.result === 'PROMOTED') tier = Math.min(10, lastWeek.leagueGroup.tier + 1);
      else if (lastWeek.result === 'DEMOTED') tier = Math.max(1, lastWeek.leagueGroup.tier - 1);
      else tier = lastWeek.leagueGroup.tier;
    }

    // Find or create a group for this tier and week
    let group = await tx.leagueGroup.findFirst({
      where: { 
        tier, 
        weekKey,
        memberCount: { lt: 30 }
      }
    });

    if (!group) {
      group = await tx.leagueGroup.create({
        data: {
          tier,
          weekKey,
          memberCount: 0
        }
      });
    }

    // Join the group
    userLeague = await tx.userLeague.create({
      data: {
        userId,
        leagueGroupId: group.id,
        weekKey,
        xpEarned: xpAmount
      },
      include: { leagueGroup: true }
    });

    // Update group member count
    await tx.leagueGroup.update({
      where: { id: group.id },
      data: { memberCount: { increment: 1 } }
    });
  } else {
    // 3. User already in league, just increment XP
    await tx.userLeague.update({
      where: { id: userLeague.id },
      data: { xpEarned: { increment: xpAmount } }
    });
  }

  return userLeague;
}
