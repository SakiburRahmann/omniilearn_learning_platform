import { z } from "zod";
import { createTRPCRouter, developerProcedure } from "../trpc";
import { db } from "@/lib/prisma";

export const devRouter = createTRPCRouter({
  /**
   * Platform-wide statistics for developer observability.
   * Includes high-level counts and performance metrics.
   */
  getStats: developerProcedure.query(async () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalStudents,
      totalCreators,
      totalAdmin,
      totalCourses,
      publishedCourses,
      totalUnits,
      totalLessons,
      totalCompletions,
      totalEnrollments,
      totalXpEvents,
      activeToday,
      registeredThisWeek,
      maintenance,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "STUDENT" } }),
      db.user.count({ where: { role: "COURSE_CREATOR" } }),
      db.user.count({ where: { role: "ADMIN" } }),
      db.course.count(),
      db.course.count({ where: { status: "PUBLISHED" } }),
      db.unit.count(),
      db.lesson.count(),
      db.lessonCompletion.count(),
      db.enrollment.count(),
      db.xpEvent.count(),
      db.lessonCompletion.groupBy({
        by: ["userId"],
        where: { completedAt: { gte: todayStart } },
      }).then((r) => r.length),
      db.user.count({ where: { createdAt: { gte: weekAgo } } }),
      (db as any).platformSettings.findUnique({ where: { id: "singleton" } }),
    ]);

    return {
      counts: {
        users: { total: totalUsers, students: totalStudents, creators: totalCreators, admins: totalAdmin },
        content: { courses: totalCourses, published: publishedCourses, units: totalUnits, lessons: totalLessons },
        activity: { completions: totalCompletions, enrollments: totalEnrollments, xpEvents: totalXpEvents, activeToday },
        growth: { registeredThisWeek },
      },
      health: {
        maintenanceMode: maintenance?.maintenanceMode ?? false,
        maintenanceStarted: maintenance?.maintenanceStarted ?? null,
        dbStatus: "CONNECTED", // Simple flag for now
      }
    };
  }),

  /**
   * Get all users across all roles — paginated, searchable.
   */
  getAllUsers: developerProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(25),
      role: z.enum(["STUDENT", "COURSE_CREATOR", "ADMIN", "DEVELOPER"]).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const where: Record<string, any> = {};
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
            studentProfile: { select: { totalXp: true, currentStreak: true } },
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
   * Get detailed view of a specific user.
   */
  getUserDetail: developerProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return db.user.findUniqueOrThrow({
        where: { id: input.userId },
        include: {
          studentProfile: true,
          enrollments: {
            include: {
              course: { select: { title: true, slug: true } },
            },
            orderBy: { enrolledAt: "desc" },
            take: 20,
          },
          _count: {
            select: {
              completions: true,
              xpEvents: true,
              userBadges: true,
            },
          },
        },
      });
    }),

  /**
   * GOD MODE: Update any field on a user.
   */
  godUpdateUser: developerProcedure
    .input(z.object({
      userId: z.string(),
      data: z.object({
        email: z.string().email().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        role: z.enum(["STUDENT", "COURSE_CREATOR", "ADMIN", "DEVELOPER"]).optional(),
        status: z.enum(["UNVERIFIED", "VERIFIED", "SUSPENDED", "DELETED"]).optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const user = await db.user.update({
        where: { id: input.userId },
        data: input.data,
      });

      await (db as any).devAuditLog.create({
        data: {
          actionType: "UPDATE_USER",
          targetEntityType: "USER",
          targetEntityId: input.userId,
          payload: input.data as any,
        },
      });

      return user;
    }),

  /**
   * GOD MODE: Update student profile stats.
   */
  godUpdateStudentProfile: developerProcedure
    .input(z.object({
      userId: z.string(),
      data: z.object({
        totalXp: z.number().min(0).optional(),
        currentStreak: z.number().min(0).optional(),
        longestStreak: z.number().min(0).optional(),
        heartsCurrent: z.number().min(0).max(5).optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const profile = await db.studentProfile.update({
        where: { userId: input.userId },
        data: input.data,
      });

      await (db as any).devAuditLog.create({
        data: {
          actionType: "UPDATE_PROFILE",
          targetEntityType: "USER",
          targetEntityId: input.userId,
          payload: input.data as any,
        },
      });

      return profile;
    }),

  /**
   * GOD MODE: Update any course.
   */
  godUpdateCourse: developerProcedure
    .input(z.object({
      courseId: z.string(),
      data: z.object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED", "REJECTED"]).optional(),
        difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const course = await (db as any).course.update({
        where: { id: input.courseId },
        data: input.data as any,
      });

      await (db as any).devAuditLog.create({
        data: {
          actionType: "UPDATE_COURSE",
          targetEntityType: "COURSE",
          targetEntityId: input.courseId,
          payload: input.data as any,
        },
      });

      return course;
    }),

  /**
   * Get maintenance mode status.
   */
  getMaintenanceStatus: developerProcedure.query(async () => {
    const settings = await (db as any).platformSettings.findUnique({ where: { id: "singleton" } });
    return {
      maintenanceMode: settings?.maintenanceMode ?? false,
      maintenanceMessage: settings?.maintenanceMessage ?? null,
      maintenanceStarted: settings?.maintenanceStarted ?? null,
    };
  }),

  /**
   * Toggle maintenance mode.
   */
  toggleMaintenance: developerProcedure
    .input(z.object({
      enabled: z.boolean(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const settings = (db as any).platformSettings;
      await settings.upsert({
        where: { id: "singleton" },
        create: {
          id: "singleton",
          maintenanceMode: input.enabled,
          maintenanceMessage: input.message ?? null,
          maintenanceStarted: input.enabled ? new Date() : null,
        },
        update: {
          maintenanceMode: input.enabled,
          maintenanceMessage: input.message ?? null,
          maintenanceStarted: input.enabled ? new Date() : null,
        },
      });

      await (db as any).devAuditLog.create({
        data: {
          actionType: "TOGGLE_MAINTENANCE",
          targetEntityType: "SYSTEM",
          targetEntityId: "singleton",
          payload: input as any,
        },
      });

      return { success: true, enabled: input.enabled };
    }),

  /**
   * GOD MODE: Get raw audit logs.
   */
  getAuditLogs: developerProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ input }) => {
      return db.devAuditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),
});
