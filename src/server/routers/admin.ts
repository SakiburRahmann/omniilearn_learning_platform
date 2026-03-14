import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { db } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const adminRouter = createTRPCRouter({
  /**
   * Platform-wide statistics for admin dashboard.
   */
  getStats: adminProcedure.query(async () => {
    const [userCount, courseCount, enrollmentCount, creatorCount] = await Promise.all([
      db.user.count({ where: { role: "STUDENT" } }),
      db.course.count(),
      db.enrollment.count(),
      db.user.count({ where: { role: "COURSE_CREATOR" } }),
    ]);

    return { userCount, courseCount, enrollmentCount, creatorCount };
  }),

  /**
   * Paginated user list with role and status filtering.
   */
  listUsers: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      role: z.enum(["STUDENT", "COURSE_CREATOR", "ADMIN", "DEVELOPER"]).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const where: Record<string, unknown> = {};
      if (input.role) where.role = input.role;
      if (input.search) {
        where.OR = [
          { email: { contains: input.search, mode: "insensitive" } },
          { firstName: { contains: input.search, mode: "insensitive" } },
          { lastName: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const [users, total] = await Promise.all([
        db.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
            createdAt: true,
            studentProfile: { select: { totalXp: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        db.user.count({ where }),
      ]);

      return { users, total, pages: Math.ceil(total / input.limit) };
    }),

  /**
   * Create a new Course Creator account.
   * Email format: name.coursedesigner@omniilearn.com
   */
  createCreatorAccount: adminProcedure
    .input(z.object({
      email: z.string().email().refine(
        (e) => e.endsWith(".coursedesigner@omniilearn.com"),
        "Creator email must follow the format: name.coursedesigner@omniilearn.com"
      ),
      password: z.string().min(8, "Password must be at least 8 characters"),
      firstName: z.string().min(2),
      lastName: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      // 1. Create in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: {
          first_name: input.firstName,
          last_name: input.lastName,
        },
      });

      if (authError) {
        if (authError.message.includes("already registered") || authError.status === 422) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This email is already registered.",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: authError.message,
        });
      }

      if (!authData.user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create auth account.",
        });
      }

      // 2. Create in Prisma with COURSE_CREATOR role
      await db.user.upsert({
        where: { email: input.email },
        create: {
          id: authData.user.id,
          email: input.email,
          passwordHash: "SUPABASE_AUTH",
          firstName: input.firstName,
          lastName: input.lastName,
          role: "COURSE_CREATOR",
          status: "VERIFIED",
          emailVerified: true,
          creatorProfile: {
            create: {
              platformEmail: input.email,
              bio: "",
              expertise: "General",
              experienceYears: 0,
            },
          },
        },
        update: {
          role: "COURSE_CREATOR",
          status: "VERIFIED",
          emailVerified: true,
        },
      });

      return { success: true, email: input.email };
    }),

  /**
   * Suspend a user (blocks login).
   */
  suspendUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const target = await db.user.findUnique({ where: { id: input.userId } });
      if (!target) throw new TRPCError({ code: "NOT_FOUND" });

      // Cannot suspend developer or admin (only dev can manage admin)
      if (target.role === "DEVELOPER") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot suspend developer." });
      }
      if (target.role === "ADMIN" && ctx.dbUser.role !== "DEVELOPER") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only developer can suspend admin." });
      }

      await db.user.update({
        where: { id: input.userId },
        data: { status: "SUSPENDED" },
      });

      return { success: true };
    }),

  /**
   * Restore a suspended user.
   */
  restoreUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      await db.user.update({
        where: { id: input.userId },
        data: { status: "VERIFIED" },
      });
      return { success: true };
    }),

  /**
   * List all courses with assignment info.
   */
  listCourses: adminProcedure.query(async () => {
    return db.course.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        category: true,
        difficulty: true,
        createdAt: true,
        creators: {
          select: {
            creator: { select: { id: true, firstName: true, lastName: true, email: true } },
            assignedAt: true,
          },
        },
        _count: { select: { units: true, lessons: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  /**
   * Create a new course shell (DRAFT status).
   */
  createCourse: adminProcedure
    .input(z.object({
      title: z.string().min(3),
      slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
      subtitle: z.string().min(3),
      description: z.string().min(10),
      category: z.string().min(2),
      difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const exists = await db.course.findUnique({ where: { slug: input.slug } });
      if (exists) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "A course with this slug already exists." });
      }

      const course = await db.course.create({
        data: {
          ...input,
          createdByAdminId: ctx.dbUser.id,
          status: "DRAFT",
          whatYouLearn: [],
        },
      });

      return { id: course.id, slug: course.slug };
    }),

  /**
   * Assign a course creator to a course.
   */
  assignCreator: adminProcedure
    .input(z.object({
      courseId: z.string(),
      creatorUserId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const creator = await db.user.findUnique({ where: { id: input.creatorUserId } });
      if (!creator || creator.role !== "COURSE_CREATOR") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User is not a course creator." });
      }

      await db.courseCreatorAssignment.upsert({
        where: {
          courseId_creatorUserId: {
            courseId: input.courseId,
            creatorUserId: input.creatorUserId,
          },
        },
        create: { courseId: input.courseId, creatorUserId: input.creatorUserId },
        update: {},
      });

      return { success: true };
    }),

  /**
   * Remove a creator from a course.
   */
  removeCreator: adminProcedure
    .input(z.object({
      courseId: z.string(),
      creatorUserId: z.string(),
    }))
    .mutation(async ({ input }) => {
      await db.courseCreatorAssignment.delete({
        where: {
          courseId_creatorUserId: {
            courseId: input.courseId,
            creatorUserId: input.creatorUserId,
          },
        },
      });
      return { success: true };
    }),

  /**
   * Update course status (e.g., DRAFT → PUBLISHED).
   */
  updateCourseStatus: adminProcedure
    .input(z.object({
      courseId: z.string(),
      status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "REJECTED"]),
    }))
    .mutation(async ({ input }) => {
      await db.course.update({
        where: { id: input.courseId },
        data: { status: input.status },
      });
      return { success: true };
    }),

  /**
   * List course creator applications.
   */
  listApplications: adminProcedure.query(async () => {
    return db.creatorApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }),
});
