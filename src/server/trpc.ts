import { TRPCError, initTRPC } from "@trpc/server";
import { ZodError } from "zod";
import { db } from "@/lib/prisma";
import { createClient } from "../lib/supabase-server";
import { ensureUserSynced } from "@/lib/user-sync";

export const createTRPCContext = async (opts: { headers: Headers }) => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return {
        db,
        user,
        ...opts,
    };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause instanceof ZodError ? error.cause.flatten() : null,
            },
        };
    },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure — requires authenticated user.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

/**
 * Admin procedure — requires ADMIN or DEVELOPER role.
 * Fetches the synced user from the database to verify role.
 */
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const dbUser = await ensureUserSynced(ctx.user);
  if (dbUser.role !== "ADMIN" && dbUser.role !== "DEVELOPER") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required.",
    });
  }

  return next({
    ctx: { user: ctx.user, dbUser },
  });
});

/**
 * Creator procedure — requires COURSE_CREATOR, ADMIN, or DEVELOPER role.
 */
export const creatorProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const dbUser = await ensureUserSynced(ctx.user);
  if (
    dbUser.role !== "COURSE_CREATOR" &&
    dbUser.role !== "ADMIN" &&
    dbUser.role !== "DEVELOPER"
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Creator access required.",
    });
  }

  return next({
    ctx: { user: ctx.user, dbUser },
  });
});

/**
 * Developer procedure — requires DEVELOPER role exclusively.
 * This is the highest privilege tier.
 */
export const developerProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const dbUser = await ensureUserSynced(ctx.user);
  if (dbUser.role !== "DEVELOPER") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Developer access required.",
    });
  }

  return next({
    ctx: { user: ctx.user, dbUser },
  });
});
