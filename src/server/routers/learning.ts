import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { db } from "@/lib/prisma";

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
    .mutation(async ({ input, ctx }: { input: any; ctx: any }) => {
      const supabaseUser = ctx.user;
      const userId = supabaseUser.id;
      
      return await db.$transaction(async (tx) => {
        // 0. Lazy User Sync (Ensures Prisma User record exists)
        await tx.user.upsert({
          where: { id: userId },
          create: {
            id: userId,
            email: supabaseUser.email!,
            firstName: supabaseUser.user_metadata?.first_name || "Student",
            lastName: supabaseUser.user_metadata?.last_name || "",
            passwordHash: "SUPABASE_AUTH",
            status: "VERIFIED",
            emailVerified: true,
          },
          update: {
            email: supabaseUser.email!, // Keep email synced
          },
        });

        // 1. Create completion
        const completion = await tx.lessonCompletion.create({
          data: {
            userId,
            lessonId: input.lessonId,
            courseId: input.courseId,
            xpEarned: input.xpEarned,
            timeSpentSeconds: 60,
          }
        });

        // 2. Grant XP (Ensure profile exists)
        await tx.studentProfile.upsert({
          where: { userId },
          create: {
            userId,
            totalXp: input.xpEarned,
            heartsCurrent: 5,
          },
          update: {
            totalXp: { increment: input.xpEarned }
          }
        });

        await tx.xpEvent.create({
          data: {
            userId,
            amount: input.xpEarned,
            reason: 'READING_COMPLETE',
            referenceId: input.lessonId
          }
        });

        // 3. Unlock next lesson logic
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
                  userId,
                  lessonId: nextLesson.id
                }
              },
              update: {},
              create: {
                userId,
                lessonId: nextLesson.id
              }
            });
          }
        }

        return completion;
      });
    }),
});
