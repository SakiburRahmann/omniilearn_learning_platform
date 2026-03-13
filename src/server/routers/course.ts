import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { db } from "@/lib/prisma";

export const courseRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async () => {
      return await db.course.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          slug: true,
          title: true,
          subtitle: true,
          description: true,
          thumbnailUrl: true,
          category: true,
          difficulty: true,
        },
        orderBy: { createdAt: 'desc' }
      });
    }),

  enroll: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ input, ctx }: { input: { courseId: string }, ctx: any }) => {
      const userId = ctx.user.id;
      
      return await db.enrollment.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId: input.courseId
          }
        },
        update: {},
        create: {
          userId,
          courseId: input.courseId
        }
      });
    }),

  getUserEnrollments: protectedProcedure
    .query(async ({ ctx }: { ctx: any }) => {
      return await db.enrollment.findMany({
        where: { userId: ctx.user.id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        }
      });
    })
});
