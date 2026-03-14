import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/lib/prisma";
import { ensureUserSynced } from "@/lib/user-sync";
import { calculateCurrentHearts, calculateNewStreak } from "@/lib/gamification";
import { syncUserLeagueXP } from "@/lib/league-sync";
import { updateQuestProgress } from "@/lib/quest-sync";

export const learningRouter = createTRPCRouter({
  /**
   * Fetch the learning path for a course.
   * Optimized with Selective Selection and Parallel Execution.
   */
  getLearningPath: publicProcedure
    .input(z.object({ 
      courseSlug: z.string().optional(),
      userId: z.string().optional() 
    }))
    .query(async ({ input }) => {
      let courseId = "";

      // 1. Efficient enrollment lookup
      if (!input.courseSlug && input.userId) {
        const lastEnrollment = await db.enrollment.findFirst({
          where: { userId: input.userId },
          orderBy: { enrolledAt: 'desc' },
          select: { courseId: true }
        });
        if (lastEnrollment) courseId = lastEnrollment.courseId;
      }

      // 2. Fetch course structure with tight selects
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

      // 3. Parallelize completions and unlocks
      let completedLessonIds = new Set<string>();
      let unlockedLessonIds = new Set<string>();

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
        completions.forEach(c => completedLessonIds.add(c.lessonId));
        unlocks.forEach(u => unlockedLessonIds.add(u.lessonId));
      }

      // 4. Transform data in-memory (O(N) where N is total lessons)
      const units = course.units.map((unit, unitIndex) => ({
        ...unit,
        lessons: unit.lessons.map((lesson, lessonIndex) => {
          let status: 'COMPLETED' | 'ACTIVE' | 'LOCKED' = 'LOCKED';
          
          if (completedLessonIds.has(lesson.id)) {
            status = 'COMPLETED';
          } else if (unlockedLessonIds.has(lesson.id) || (unitIndex === 0 && lessonIndex === 0)) {
            status = 'ACTIVE';
          }

          return {
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            status,
            position: lesson.position
          };
        })
      }));

      return { courseTitle: course.title, units };
    }),

  getLessonContent: publicProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ input }) => {
      return await db.lesson.findUnique({
        where: { id: input.lessonId },
        select: {
          id: true,
          title: true,
          type: true,
          courseId: true,
          content: {
            select: {
              id: true,
              content: true,
              testQuestions: true,
              passingThreshold: true
            }
          },
          unit: {
            select: {
              id: true,
              title: true,
              courseId: true
            }
          }
        }
      });
    }),

  /**
   * Atomic Lesson Completion with Multi-Level Sync.
   * Optimized with Direct Updates where possible.
   */
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
        // 1. Parallel fetch of profile and current lesson
        const [profile, currentLesson] = await Promise.all([
          tx.studentProfile.findUniqueOrThrow({
            where: { userId: dbUserId },
            select: { 
              heartsCurrent: true, 
              heartsLastRefill: true,
              currentStreak: true,
              longestStreak: true,
              streakLastUpdated: true
            }
          }),
          tx.lesson.findUniqueOrThrow({
            where: { id: input.lessonId },
            select: { position: true, unitId: true }
          })
        ]);

        const { current: heartsNow, nextRegenMs } = calculateCurrentHearts(profile.heartsCurrent, profile.heartsLastRefill);
        const streakState = calculateNewStreak(profile.currentStreak, profile.streakLastUpdated);

        // 2. Parallel data operations
        const [completion] = await Promise.all([
          tx.lessonCompletion.create({
            data: {
              userId: dbUserId,
              lessonId: input.lessonId,
              courseId: input.courseId,
              xpEarned: input.xpEarned,
              timeSpentSeconds: 60,
            }
          }),
          tx.studentProfile.update({
            where: { userId: dbUserId },
            data: {
              totalXp: { increment: input.xpEarned },
              currentStreak: streakState.shouldUpdate ? streakState.newStreak : undefined,
              streakLastUpdated: streakState.shouldUpdate ? new Date() : undefined,
              longestStreak: (streakState.shouldUpdate && streakState.newStreak > profile.longestStreak) ? streakState.newStreak : undefined,
              heartsCurrent: heartsNow > profile.heartsCurrent ? heartsNow : undefined,
              heartsLastRefill: heartsNow > profile.heartsCurrent ? new Date() : undefined,
            }
          }),
          tx.xpEvent.create({
            data: {
              userId: dbUserId,
              amount: input.xpEarned,
              reason: 'READING_COMPLETE',
              referenceId: input.lessonId
            }
          }),
          // 6b. Sync XP with Weekly League (optimized within tx)
          syncUserLeagueXP(dbUserId, input.xpEarned, tx),
          // 6c. Sync Daily Quests (XP and Lesson Complete)
          updateQuestProgress(dbUserId, 'XP_GAIN', input.xpEarned, tx),
          updateQuestProgress(dbUserId, 'LESSON_COMPLETE', 1, tx)
        ]);

        // 3. Unlock next lesson (Sequential but optimized)
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
            where: { userId_lessonId: { userId: dbUserId, lessonId: nextLesson.id } },
            update: {},
            create: { userId: dbUserId, lessonId: nextLesson.id }
          });
        }

        return {
          id: completion.id,
          newStreak: streakState.newStreak,
          xpGained: input.xpEarned
        };
      });
    }),
});
