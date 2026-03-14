import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/prisma";
import { getCurrentWeekKey } from "@/lib/gamification";
import { TRPCError } from "@trpc/server";
import { ensureUserSynced } from "@/lib/user-sync";

// In-Memory Cache for Global Leaderboards (TTL: 1 minute)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

export const leagueRouter = createTRPCRouter({
  /**
   * League Cohort: Users in the same group of 30
   */
  getCurrentLeague: protectedProcedure
    .query(async ({ ctx }) => {
      const weekKey = getCurrentWeekKey();
      const user = await ensureUserSynced(ctx.user);
      const userId = user.id;

      // High-performance finding using unified unique index
      let userLeague = await db.userLeague.findFirst({
        where: { userId, weekKey },
        include: { leagueGroup: { select: { id: true, tier: true, weekKey: true } } }
      });

      // Join if not in a league
      if (!userLeague) {
        userLeague = await db.$transaction(async (tx) => {
          const existing = await tx.userLeague.findFirst({
             where: { userId, weekKey },
             include: { leagueGroup: true }
          });
          if (existing) return existing;

          const lastWeeksEntry = await tx.userLeague.findFirst({
            where: { userId },
            orderBy: { weekKey: 'desc' },
            select: { result: true, leagueGroup: { select: { tier: true } } }
          });

          let tier = 1;
          if (lastWeeksEntry) {
            if (lastWeeksEntry.result === 'PROMOTED') tier = Math.min(10, (lastWeeksEntry.leagueGroup?.tier || 1) + 1);
            else if (lastWeeksEntry.result === 'DEMOTED') tier = Math.max(1, (lastWeeksEntry.leagueGroup?.tier || 1) - 1);
            else tier = lastWeeksEntry.leagueGroup?.tier || 1;
          }

          let group = await tx.leagueGroup.findFirst({
            where: { tier, weekKey, memberCount: { lt: 30 } },
            select: { id: true }
          });

          if (!group) {
            group = await tx.leagueGroup.create({
              data: { tier, weekKey, memberCount: 0 },
              select: { id: true }
            });
          }

          const joined = await tx.userLeague.create({
            data: { userId, leagueGroupId: group.id, weekKey, xpEarned: 0 },
            include: { leagueGroup: true }
          });

          await tx.leagueGroup.update({
            where: { id: group.id },
            data: { memberCount: { increment: 1 } }
          });

          return joined;
        }) as any;
      }

      if (!userLeague) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to join league" });
      }

      // Fetch the full leaderboard for this group - ULTRA FAST query with composite index [leagueGroupId, xpEarned DESC]
      const leaderboard = await db.userLeague.findMany({
        where: { leagueGroupId: userLeague.leagueGroupId },
        select: {
          id: true,
          userId: true,
          xpEarned: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentProfile: { select: { avatarConfig: true } }
            }
          }
        },
        orderBy: { xpEarned: 'desc' },
        take: 30
      });

      const rank = leaderboard.findIndex(e => e.userId === userId) + 1;

      return {
        userLeague,
        leaderboard,
        weekKey,
        personalRank: rank || (leaderboard.length + 1),
        dbUserId: userId
      };
    }),

  /**
   * Global This Week: Top 50 by weekly XP (Cached)
   */
  getThisWeekLeaderboard: protectedProcedure
    .query(async ({ ctx }) => {
      const weekKey = getCurrentWeekKey();
      const user = await ensureUserSynced(ctx.user);
      const userId = user.id;

      const cacheKey = `week_${weekKey}`;
      let topUsers = getCached(cacheKey);

      if (!topUsers) {
        topUsers = await db.userLeague.findMany({
          where: { weekKey },
          orderBy: { xpEarned: 'desc' },
          take: 50,
          select: {
            userId: true,
            xpEarned: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                studentProfile: { select: { avatarConfig: true } }
              }
            }
          }
        });
        setCache(cacheKey, topUsers);
      }

      // Calculate personal rank if not in top 50
      let personalRank = topUsers.findIndex((u: any) => u.userId === userId) + 1;
      let personalXp = 0;

      if (personalRank === 0) {
        const userEntry = await db.userLeague.findFirst({
          where: { userId, weekKey },
          select: { xpEarned: true }
        });
        personalXp = userEntry?.xpEarned || 0;
        
        const countHigher = await db.userLeague.count({
          where: { weekKey, xpEarned: { gt: personalXp } }
        });
        personalRank = countHigher + 1;
      } else {
        personalXp = topUsers[personalRank - 1].xpEarned;
      }

      return {
        topUsers: topUsers.map((u: any, i: number) => ({
          userId: u.userId,
          firstName: u.user.firstName,
          lastName: u.user.lastName,
          avatarConfig: (u.user.studentProfile as any)?.avatarConfig,
          xp: u.xpEarned,
          rank: i + 1
        })),
        personalRank,
        personalXp,
        dbUserId: userId
      };
    }),

  /**
   * All Time: Top 50 by total XP (Cached)
   */
  getAllTimeLeaderboard: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ensureUserSynced(ctx.user);
      const userId = user.id;

      const cacheKey = "all_time";
      let topProfiles = getCached(cacheKey);

      if (!topProfiles) {
        topProfiles = await db.studentProfile.findMany({
          orderBy: { totalXp: 'desc' },
          take: 50,
          select: {
            userId: true,
            totalXp: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            avatarConfig: true
          }
        });
        setCache(cacheKey, topProfiles);
      }

      let personalRank = topProfiles.findIndex((p: any) => p.userId === userId) + 1;
      let personalXp = 0;

      if (personalRank === 0) {
        const userProfile = await db.studentProfile.findUnique({
          where: { userId },
          select: { totalXp: true }
        });
        personalXp = userProfile?.totalXp || 0;

        const countHigher = await db.studentProfile.count({
          where: { totalXp: { gt: personalXp } }
        });
        personalRank = countHigher + 1;
      } else {
        personalXp = topProfiles[personalRank - 1].totalXp;
      }

      return {
        topUsers: topProfiles.map((p: any, i: number) => ({
          userId: p.userId,
          firstName: p.user.firstName,
          lastName: p.user.lastName,
          avatarConfig: (p as any).avatarConfig,
          xp: p.totalXp,
          rank: i + 1
        })),
        personalRank,
        personalXp,
        dbUserId: userId
      };
    })
});
