import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/prisma";
import { getCurrentWeekKey } from "@/lib/gamification";
import { TRPCError } from "@trpc/server";

export const leagueRouter = createTRPCRouter({
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

      // If user isn't in a league for this week yet, join them
      if (!userLeague) {
        userLeague = await db.$transaction(async (tx) => {
          // 1. Determine tier
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

          // 2. Find an available group in this tier
          let group = await tx.leagueGroup.findFirst({
            where: { 
              tier, 
              weekKey,
              memberCount: { lt: 30 }
            }
          });

          // 3. Create group if none available
          if (!group) {
            group = await tx.leagueGroup.create({
              data: {
                tier,
                weekKey,
                memberCount: 0
              }
            });
          }

          // 4. Join the group
          const newUserLeague = await tx.userLeague.create({
            data: {
              userId,
              leagueGroupId: group.id,
              weekKey,
              xpEarned: 0
            },
            include: {
              leagueGroup: true
            }
          });

          // 5. Increment member count
          await tx.leagueGroup.update({
            where: { id: group.id },
            data: { memberCount: { increment: 1 } }
          });

          // 6. Recruitment: If group is empty/small, pull in other real users
          // This ensures the league feels alive with real people immediately
          const potentialRecruits = await tx.user.findMany({
            where: {
              id: { not: userId },
              status: 'VERIFIED',
              studentProfile: { isNot: null },
              leagueHistory: {
                none: { weekKey: weekKey }
              }
            },
            take: 20,
            include: { 
              studentProfile: {
                select: { totalXp: true }
              }
            }
          });

          if (potentialRecruits.length > 0) {
            const recruitsData = (potentialRecruits as any[]).map(r => ({
              userId: r.id,
              leagueGroupId: group.id,
              weekKey,
              xpEarned: Math.floor(Math.random() * (r.studentProfile?.totalXp || 100) * 0.15)
            }));

            await tx.userLeague.createMany({
              data: recruitsData
            });

            await tx.leagueGroup.update({
              where: { id: group.id },
              data: { memberCount: { increment: recruitsData.length } }
            });
          }

          return newUserLeague;
        });
      }

      // Fetch the full leaderboard for this group - Optimized with select
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
              studentProfile: {
                select: { avatarConfig: true }
              }
            }
          }
        },
        orderBy: { xpEarned: 'desc' },
        take: 30
      });

      return {
        userLeague,
        leaderboard,
        weekKey
      };
    }),

  getGlobalLeaderboard: protectedProcedure
    .query(async () => {
      // Fetch top 50 users by total XP platform-wide
      const topUsers = await db.studentProfile.findMany({
        orderBy: { totalXp: 'desc' },
        take: 50,
        select: {
          totalXp: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentProfile: {
                select: { avatarConfig: true }
              }
            }
          }
        }
      });

      return {
        topUsers: topUsers.map(profile => ({
          userId: profile.user.id,
          firstName: profile.user.firstName,
          lastName: profile.user.lastName,
          avatarConfig: profile.user.studentProfile?.avatarConfig,
          xp: profile.totalXp
        }))
      };
    })
});
