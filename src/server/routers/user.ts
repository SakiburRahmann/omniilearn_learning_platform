import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  syncProfile: publicProcedure
    .input(z.object({
      email: z.string().email(),
      firstName: z.string(),
      lastName: z.string(),
      supabaseId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.upsert({
          where: { email: input.email },
          update: {
            firstName: input.firstName,
            lastName: input.lastName,
            emailVerified: true, // Auto-verify for MVP speed
            status: "VERIFIED",
          },
          create: {
            id: input.supabaseId,
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            passwordHash: "SUPABASE_AUTH", // Handled by Supabase
            emailVerified: true,
            status: "VERIFIED",
            studentProfile: {
              create: {
                totalXp: 0,
                currentStreak: 0,
              }
            }
          },
        });

        return { success: true, userId: user.id };
      } catch (error) {
        console.error("❌ Profile Sync Failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync user profile",
        });
      }
    }),
});
