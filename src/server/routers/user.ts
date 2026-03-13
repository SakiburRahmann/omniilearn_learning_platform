import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { ensureUserSynced } from "@/lib/user-sync";

export const userRouter = createTRPCRouter({
  syncProfile: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const user = await ensureUserSynced(ctx.user);
        return { success: true, userId: user.id };
      } catch (error: any) {
        console.error("❌ Profile Sync Failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to sync user profile",
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
      } catch (error: any) {
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
      return user;
    }),
});
