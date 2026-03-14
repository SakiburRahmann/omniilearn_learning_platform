import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/lib/prisma";
import { ensureUserSynced } from "@/lib/user-sync";
import { calculateCurrentHearts, calculateNewStreak } from "@/lib/gamification";
import { syncUserLeagueXP } from "@/lib/league-sync";

export const learningRouter = createTRPCRouter({
  getLearningPath: publicProcedure
    .input(z.object({ 
      courseSlug: z.string().optional(),
      userId: z.string().optional() 
    }))
    .query(async ({ input }) => {
      let courseId = "";

      // 1. If courseSlug not provided, find the user's most recent enrollment
      if (!input.courseSlug && input.userId) {
        const lastEnrollment = await db.enrollment.findFirst({
          where: { userId: input.userId },
          orderBy: { enrolledAt: 'desc' },
          select: { courseId: true }
        });
        if (lastEnrollment) courseId = lastEnrollment.courseId;
      }

      // 2. Fetch the course path
      const course = await db.course.findFirst({
        where: input.courseSlug ? { slug: input.courseSlug } : (courseId ? { id: courseId } : { status: 'PUBLISHED' }),
        select: {
          id: true,
          title: true,
          units: {
            orderBy: { position: 'asc' },
            select: {
              id: true,
              title: true,
              position: true,
              lessons: {
                orderBy: { position: 'asc' },
                select: {
                  id: true,
                  title: true,
                  type: true,
                  position: true
                }
              }
            }
          }
        }
      });

      if (!course) return null;

      // 2. Get user's progress if userId provided
      let completedLessonIds: string[] = [];
      let unlockedLessonIds: string[] = [];

      if (input.userId) {
        const [completions, unlocks] = await Promise.all([
          db.lessonCompletion.findMany({
            where: { userId: input.userId, courseId: course.id },
            select: { lessonId: true }
          }),
          db.lessonUnlock.findMany({
            where: { userId: input.userId },
            select: { lessonId: true }
          })
        ]);
        completedLessonIds = completions.map(c => c.lessonId);
        unlockedLessonIds = unlocks.map(u => u.lessonId);
      }

      // 3. Transform data for the UI
      // For MVP: If first time, the first lesson is 'active', rest 'locked'
      const units = course.units.map((unit, unitIndex) => {
        return {
          ...unit,
          lessons: unit.lessons.map((lesson, lessonIndex) => {
            let status: 'COMPLETED' | 'ACTIVE' | 'LOCKED' = 'LOCKED';
            
            const isCompleted = completedLessonIds.includes(lesson.id);
            const isUnlocked = unlockedLessonIds.includes(lesson.id);

            if (isCompleted) {
              status = 'COMPLETED';
            } else if (isUnlocked || (unitIndex === 0 && lessonIndex === 0)) {
              // The very first lesson is always active if nothing else is
              status = 'ACTIVE';
            } else {
              status = 'LOCKED';
            }

            return {
              id: lesson.id,
              title: lesson.title,
              type: lesson.type,
              status,
              position: lesson.position
            };
          })
        };
      });

      return {
        courseTitle: course.title,
        units
      };
    }),

  getLessonContent: publicProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ input }) => {
      const lesson = await db.lesson.findUnique({
        where: { id: input.lessonId },
        include: {
          content: true,
          unit: true
        }
      });
      return lesson;
    }),

  completeLesson: protectedProcedure
    .input(z.object({ 
      lessonId: z.string(),
      courseId: z.string(),
      xpEarned: z.number().default(10)
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await ensureUserSynced(ctx.user);
      const dbUserId = user.id;
      
      return await db.$transaction(async (tx) => {
        // 1. Fetch profile and current hearts
        const profile = await tx.studentProfile.findUnique({
          where: { userId: dbUserId },
          select: { 
            heartsCurrent: true, 
            heartsLastRefill: true,
            currentStreak: true,
            longestStreak: true,
            streakLastUpdated: true
          }
        });

        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Student profile not found",
          });
        }

        const { current, nextRegenMs } = calculateCurrentHearts(profile.heartsCurrent, profile.heartsLastRefill);
        const heartState = { current, nextRegenMs };
        
        const streakState = calculateNewStreak(profile.currentStreak, profile.streakLastUpdated);

        // 4. Create completion record
        const completion = await tx.lessonCompletion.create({
          data: {
            userId: dbUserId,
            lessonId: input.lessonId,
            courseId: input.courseId,
            xpEarned: input.xpEarned,
            timeSpentSeconds: 60,
          }
        });

        // 5. Update Profile with XP, Streak, and Hearts
        const updateData: {
          totalXp?: { increment: number };
          currentStreak?: number;
          streakLastUpdated?: Date;
          longestStreak?: number;
          heartsCurrent?: number;
          heartsLastRefill?: Date;
        } = {
          totalXp: { increment: input.xpEarned }
        };

        if (streakState.shouldUpdate) {
          updateData.currentStreak = streakState.newStreak;
          updateData.streakLastUpdated = new Date();
          if (streakState.newStreak > profile.longestStreak) {
            updateData.longestStreak = streakState.newStreak;
          }
        }

        // If hearts have regenerated, sync them to DB
        if (heartState.current > profile.heartsCurrent) {
          updateData.heartsCurrent = heartState.current;
          updateData.heartsLastRefill = new Date();
        }

        await tx.studentProfile.update({
          where: { userId: dbUserId },
          data: updateData
        });

        // 6. Log XP Event
        await tx.xpEvent.create({
          data: {
            userId: dbUserId,
            amount: input.xpEarned,
            reason: 'READING_COMPLETE',
            referenceId: input.lessonId
          }
        });

        // 6b. Sync XP with Weekly League
        await syncUserLeagueXP(dbUserId, input.xpEarned, tx);

        // 7. Unlock next lesson logic
        const currentLesson = await tx.lesson.findUnique({
          where: { id: input.lessonId },
          select: { position: true, unitId: true }
        });

        if (currentLesson) {
          const nextLesson = await tx.lesson.findFirst({
            where: {
              unitId: currentLesson.unitId,
              position: { gt: currentLesson.position }
            },
            orderBy: { position: 'asc' },
            select: { id: true }
          });

          if (nextLesson) {
            await tx.lessonUnlock.upsert({
              where: {
                userId_lessonId: {
                  userId: dbUserId,
                  lessonId: nextLesson.id
                }
              },
              update: {},
              create: {
                userId: dbUserId,
                lessonId: nextLesson.id
              }
            });
          }
        }

        return {
          ...completion,
          newStreak: streakState.newStreak,
          xpGained: input.xpEarned
        };
      });
    }),
});
