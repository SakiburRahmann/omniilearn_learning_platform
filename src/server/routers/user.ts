import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { ensureUserSynced } from "@/lib/user-sync";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateCurrentHearts } from "@/lib/gamification";

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      firstName: z.string().min(2),
      lastName: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      try {
        // 1. Create user via Admin API (Bypasses rate limits & email verification)
        const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
          email: input.email,
          password: input.password,
          email_confirm: true,
          user_metadata: {
            first_name: input.firstName,
            last_name: input.lastName,
          }
        });

        if (adminError) {
          console.error("❌ Admin Registration Failed Detail:", {
            message: adminError.message,
            status: adminError.status,
            name: adminError.name,
            error: adminError
          });
          // Handle specific Supabase error codes
          if (adminError.message.includes("already registered") || adminError.status === 422) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "This email is already registered. Please login instead.",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: adminError.message || "Failed to create account. Please contact support.",
          });
        }

        if (!adminData.user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Account creation failed recursively.",
          });
        }

        // 2. Sync to Prisma immediately for data integrity
        await ensureUserSynced(adminData.user);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("❌ Registration System Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred during registration.",
        });
      }
    }),

  syncProfile: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const user = await ensureUserSynced(ctx.user);
        return { success: true, userId: user.id };
      } catch (error) {
        console.error("❌ Profile Sync Failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to sync user profile",
        });
      }
    }),

  updateAvatar: protectedProcedure
    .input(z.object({
      config: z.any(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ensureUserSynced(ctx.user);
      try {
        await ctx.db.studentProfile.update({
          where: { userId: user.id },
          data: {
            avatarConfig: input.config
          }
        });
        return { success: true };
      } catch (error) {
        console.error("❌ Failed to update avatar:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save avatar",
        });
      }
    }),

  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      // FAANG+ Standard: All profile fetches are self-healing
      const user = await ensureUserSynced(ctx.user);
      
      // Calculate virtual hearts for real-time display
      if (user.studentProfile) {
        const { current, nextRegenMs } = calculateCurrentHearts(
          user.studentProfile.heartsCurrent,
          user.studentProfile.heartsLastRefill
        );

        // Force a shallow copy to sever Prisma's recursive JsonValue typing
        const safeAvatarConfig = user.studentProfile.avatarConfig ? 
          JSON.parse(JSON.stringify(user.studentProfile.avatarConfig)) : null;
        
        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          studentProfile: {
            id: user.studentProfile.id,
            avatarConfig: safeAvatarConfig, 
            totalXp: user.studentProfile.totalXp,
            currentStreak: user.studentProfile.currentStreak,
            longestStreak: user.studentProfile.longestStreak,
            heartsCurrent: current,
            nextRegenMs: nextRegenMs
          }
        };
      }
      
      return user;
    }),
});
