import { z } from "zod";
import { createTRPCRouter, developerProcedure } from "../trpc";
import { db } from "@/lib/prisma";

export const devRouter = createTRPCRouter({
  /**
   * Platform-wide statistics for developer observability.
   * Read-only — no mutations that affect user data.
   */
  getStats: developerProcedure.query(async () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalStudents,
      totalCreators,
      totalCourses,
      publishedCourses,
      totalLessons,
      totalCompletions,
      totalEnrollments,
      totalXpEvents,
      activeToday,
      registeredThisWeek,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "STUDENT" } }),
      db.user.count({ where: { role: "COURSE_CREATOR" } }),
      db.course.count(),
      db.course.count({ where: { status: "PUBLISHED" } }),
      db.lesson.count(),
      db.lessonCompletion.count(),
      db.enrollment.count(),
      db.xpEvent.count(),
      db.lessonCompletion.groupBy({
        by: ["userId"],
        where: { completedAt: { gte: todayStart } },
      }).then((r) => r.length),
      db.user.count({ where: { createdAt: { gte: weekAgo } } }),
    ]);

    return {
      totalUsers,
      totalStudents,
      totalCreators,
      totalCourses,
      publishedCourses,
      totalLessons,
      totalCompletions,
      totalEnrollments,
      totalXpEvents,
      activeToday,
      registeredThisWeek,
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
   * Get detailed view of a specific user (read-only impersonation data).
   */
  getUserDetail: developerProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return db.user.findUniqueOrThrow({
        where: { id: input.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          studentProfile: {
            select: {
              totalXp: true,
              currentStreak: true,
              longestStreak: true,
              heartsCurrent: true,
              avatarConfig: true,
            },
          },
          enrollments: {
            select: {
              course: { select: { title: true, slug: true } },
              enrolledAt: true,
              isCompleted: true,
            },
            orderBy: { enrolledAt: "desc" },
            take: 10,
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
   * Get maintenance mode status.
   */
  getMaintenanceStatus: developerProcedure.query(async () => {
    const settings = await db.platformSettings.findUnique({ where: { id: "singleton" } });
    return {
      maintenanceMode: settings?.maintenanceMode ?? false,
      maintenanceMessage: settings?.maintenanceMessage ?? null,
      maintenanceStarted: settings?.maintenanceStarted ?? null,
    };
  }),

  /**
   * Toggle maintenance mode. The ONLY write operation in the developer portal.
   */
  toggleMaintenance: developerProcedure
    .input(z.object({
      enabled: z.boolean(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.platformSettings.upsert({
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

      return { success: true, enabled: input.enabled };
    }),

  /**
   * Get audit log entries.
   */
  getAuditLog: developerProcedure.query(async () => {
    return db.devAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        actionType: true,
        targetEntityType: true,
        targetEntityId: true,
        createdAt: true,
      },
    });
  }),
});
