import { TRPCError, initTRPC } from "@trpc/server";
import { ZodError } from "zod";
import { db } from "@/lib/prisma";
import { createClient } from "../lib/supabase-server";

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
