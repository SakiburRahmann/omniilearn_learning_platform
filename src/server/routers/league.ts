import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/prisma";
import { getCurrentWeekKey } from "@/lib/gamification";
import { TRPCError } from "@trpc/server";

export const leagueRouter = createTRPCRouter({
  /**
   * League Cohort: Users in the same group of 30
   */
  getCurrentLeague: protectedProcedure
    .query(async ({ ctx }) => {
      const weekKey = getCurrentWeekKey();
      const userId = ctx.user.id;

      let userLeague = await db.userLeague.findFirst({
        where: { userId, weekKey },
        include: {
          leagueGroup: true
        }
      });

      // Join if not in a league
      if (!userLeague) {
        userLeague = await db.$transaction(async (tx) => {
          // 1. Get tier
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

          // 2. Find a group that isn't full
          let group = await tx.leagueGroup.findFirst({
            where: { tier, weekKey, memberCount: { lt: 30 } }
          });

          // 3. Create group if none found
          if (!group) {
            group = await tx.leagueGroup.create({
              data: { tier, weekKey, memberCount: 0 }
            });
          }

          // 4. Create session and update group count
          const [newUserLeague] = await Promise.all([
            tx.userLeague.create({
              data: { userId, leagueGroupId: group.id, weekKey, xpEarned: 0 },
              include: { leagueGroup: true }
            }),
            tx.leagueGroup.update({
              where: { id: group.id },
              data: { memberCount: { increment: 1 } }
            })
          ]);

          return newUserLeague;
        }, {
          isolationLevel: 'Serializable' // Ensure atomic join
        });
      }

      // Fetch the full leaderboard for this group - FAST query
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

      // Calculate Rank Info
      const rank = leaderboard.findIndex(e => e.userId === userId) + 1;

      return {
        userLeague,
        leaderboard,
        weekKey,
        personalRank: rank || (leaderboard.length + 1)
      };
    }),

  /**
   * Global This Week: Top 50 by weekly XP
   */
  getThisWeekLeaderboard: protectedProcedure
    .query(async ({ ctx }) => {
      const weekKey = getCurrentWeekKey();
      const userId = ctx.user.id;

      const topUsers = await db.userLeague.findMany({
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

      // Calculate personal rank if not in top 50
      let personalRank = topUsers.findIndex(u => u.userId === userId) + 1;
      let personalXp = 0;

      if (personalRank === 0) {
        const userEntry = await db.userLeague.findFirst({
          where: { userId, weekKey },
          select: { xpEarned: true }
        });
        personalXp = userEntry?.xpEarned || 0;
        
        // Count users with more XP
        const countHigher = await db.userLeague.count({
          where: { weekKey, xpEarned: { gt: personalXp } }
        });
        personalRank = countHigher + 1;
      } else {
        personalXp = topUsers[personalRank - 1].xpEarned;
      }

      return {
        topUsers: topUsers.map((u, i) => ({
          userId: u.userId,
          firstName: u.user.firstName,
          lastName: u.user.lastName,
          avatarConfig: (u.user.studentProfile as any)?.avatarConfig,
          xp: u.xpEarned,
          rank: i + 1
        })),
        personalRank,
        personalXp
      };
    }),

  /**
   * All Time: Top 50 by total XP
   */
  getAllTimeLeaderboard: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;

      const topProfiles = await db.studentProfile.findMany({
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

      let personalRank = topProfiles.findIndex(p => p.userId === userId) + 1;
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
        topUsers: topProfiles.map((p, i) => ({
          userId: p.userId,
          firstName: p.user.firstName,
          lastName: p.user.lastName,
          avatarConfig: (p as any).avatarConfig,
          xp: p.totalXp,
          rank: i + 1
        })),
        personalRank,
        personalXp
      };
    })
});
