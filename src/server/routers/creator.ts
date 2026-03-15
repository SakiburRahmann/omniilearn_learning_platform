import { z } from "zod";
import { createTRPCRouter, creatorProcedure } from "../trpc";
import { db } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const creatorRouter = createTRPCRouter({
  /**
   * Get courses assigned to the current creator.
   */
  getAssignedCourses: creatorProcedure.query(async ({ ctx }) => {
    // Developer bypass: Show all courses if role is DEVELOPER
    if (ctx.dbUser.role === "DEVELOPER") {
      const allCourses = await db.course.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          subtitle: true,
          status: true,
          category: true,
          difficulty: true,
          createdAt: true,
          _count: { select: { units: true, lessons: true, enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return allCourses.map(c => ({ ...c, assignedAt: c.createdAt }));
    }

    const assignments = await db.courseCreatorAssignment.findMany({
      where: { creatorUserId: ctx.dbUser.id },
      select: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            subtitle: true,
            status: true,
            category: true,
            difficulty: true,
            createdAt: true,
            _count: { select: { units: true, lessons: true, enrollments: true } },
          },
        },
        assignedAt: true,
      },
      orderBy: { assignedAt: "desc" },
    });

    return assignments.map((a) => ({ ...a.course, assignedAt: a.assignedAt }));
  }),

  /**
   * Get full course detail with units and lessons (only if assigned).
   */
  getCourseDetail: creatorProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Verify assignment
      const isAssigned = await db.courseCreatorAssignment.findUnique({
        where: {
          courseId_creatorUserId: {
            courseId: input.courseId,
            creatorUserId: ctx.dbUser.id,
          },
        },
      });

      // Developer bypass for embedded testing
      if (!isAssigned && ctx.dbUser.role !== "DEVELOPER") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not assigned to this course." });
      }

      return db.course.findUniqueOrThrow({
        where: { id: input.courseId },
        include: {
          units: {
            orderBy: { position: "asc" },
            include: {
              lessons: {
                orderBy: { position: "asc" },
                select: {
                  id: true,
                  title: true,
                  type: true,
                  position: true,
                  estimatedMinutes: true,
                  status: true,
                },
              },
            },
          },
        },
      });
    }),

  /**
   * Create a new unit in an assigned course.
   */
  createUnit: creatorProcedure
    .input(z.object({
      courseId: z.string(),
      title: z.string().min(2),
    }))
    .mutation(async ({ input, ctx }) => {
      await verifyAssignment(input.courseId, ctx.dbUser.id, ctx.dbUser.role);

      // Get next position
      const lastUnit = await db.unit.findFirst({
        where: { courseId: input.courseId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      return db.unit.create({
        data: {
          courseId: input.courseId,
          title: input.title,
          position: (lastUnit?.position ?? 0) + 1,
        },
      });
    }),

  /**
   * Update a unit's title or position.
   */
  updateUnit: creatorProcedure
    .input(z.object({
      unitId: z.string(),
      title: z.string().min(2).optional(),
      position: z.number().min(1).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const unit = await db.unit.findUniqueOrThrow({ where: { id: input.unitId } });
      await verifyAssignment(unit.courseId, ctx.dbUser.id, ctx.dbUser.role);

      return db.unit.update({
        where: { id: input.unitId },
        data: {
          ...(input.title !== undefined && { title: input.title }),
          ...(input.position !== undefined && { position: input.position }),
        },
      });
    }),

  /**
   * Delete a unit and its lessons.
   */
  deleteUnit: creatorProcedure
    .input(z.object({ unitId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const unit = await db.unit.findUniqueOrThrow({ where: { id: input.unitId } });
      await verifyAssignment(unit.courseId, ctx.dbUser.id, ctx.dbUser.role);

      await db.unit.delete({ where: { id: input.unitId } });
      return { success: true };
    }),

  /**
   * Create a new lesson in a unit.
   */
  createLesson: creatorProcedure
    .input(z.object({
      unitId: z.string(),
      courseId: z.string(),
      title: z.string().min(2),
      type: z.enum(["READING", "EXERCISE", "QUIZ", "FINAL_ASSESSMENT"]),
      estimatedMinutes: z.number().min(1).default(5),
    }))
    .mutation(async ({ input, ctx }) => {
      await verifyAssignment(input.courseId, ctx.dbUser.id, ctx.dbUser.role);

      const lastLesson = await db.lesson.findFirst({
        where: { unitId: input.unitId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      return db.lesson.create({
        data: {
          unitId: input.unitId,
          courseId: input.courseId,
          title: input.title,
          type: input.type,
          position: (lastLesson?.position ?? 0) + 1,
          estimatedMinutes: input.estimatedMinutes,
          status: "DRAFT",
        },
      });
    }),

  /**
   * Update lesson metadata.
   */
  updateLesson: creatorProcedure
    .input(z.object({
      lessonId: z.string(),
      title: z.string().min(2).optional(),
      type: z.enum(["READING", "EXERCISE", "QUIZ", "FINAL_ASSESSMENT"]).optional(),
      estimatedMinutes: z.number().min(1).optional(),
      status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const lesson = await db.lesson.findUniqueOrThrow({ where: { id: input.lessonId } });
      await verifyAssignment(lesson.courseId, ctx.dbUser.id, ctx.dbUser.role);

      const { lessonId, ...data } = input;
      return db.lesson.update({
        where: { id: lessonId },
        data,
      });
    }),

  /**
   * Delete a lesson.
   */
  deleteLesson: creatorProcedure
    .input(z.object({ lessonId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const lesson = await db.lesson.findUniqueOrThrow({ where: { id: input.lessonId } });
      await verifyAssignment(lesson.courseId, ctx.dbUser.id, ctx.dbUser.role);

      await db.lesson.delete({ where: { id: input.lessonId } });
      return { success: true };
    }),

  /**
   * Get lesson content for editing.
   */
  getLessonContent: creatorProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ input, ctx }) => {
      const lesson = await db.lesson.findUniqueOrThrow({
        where: { id: input.lessonId },
        include: { content: true },
      });
      await verifyAssignment(lesson.courseId, ctx.dbUser.id, ctx.dbUser.role);
      return lesson;
    }),

  /**
   * Save lesson content (upsert).
   */
  saveLessonContent: creatorProcedure
    .input(z.object({
      lessonId: z.string(),
      content: z.any(),
      testQuestions: z.any().optional(),
      passingThreshold: z.number().min(0).max(100).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const lesson = await db.lesson.findUniqueOrThrow({ where: { id: input.lessonId } });
      await verifyAssignment(lesson.courseId, ctx.dbUser.id, ctx.dbUser.role);

      return db.lessonContent.upsert({
        where: { lessonId: input.lessonId },
        create: {
          lessonId: input.lessonId,
          content: input.content,
          testQuestions: input.testQuestions ?? null,
          passingThreshold: input.passingThreshold ?? 60,
        },
        update: {
          content: input.content,
          testQuestions: input.testQuestions ?? undefined,
          passingThreshold: input.passingThreshold ?? undefined,
        },
      });
    }),

  /**
   * Submit course for admin review.
   */
  submitForReview: creatorProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await verifyAssignment(input.courseId, ctx.dbUser.id, ctx.dbUser.role);

      await db.course.update({
        where: { id: input.courseId },
        data: { status: "IN_REVIEW" },
      });

      return { success: true };
    }),
});

/**
 * Verifies the user is assigned to the course.
 * Developer role bypasses this check for embedded testing.
 */
async function verifyAssignment(courseId: string, userId: string, role: string): Promise<void> {
  if (role === "DEVELOPER") return;

  const assignment = await db.courseCreatorAssignment.findUnique({
    where: {
      courseId_creatorUserId: {
        courseId,
        creatorUserId: userId,
      },
    },
  });

  if (!assignment) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not assigned to this course.",
    });
  }
}
