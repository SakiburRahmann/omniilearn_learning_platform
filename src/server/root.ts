import { createTRPCRouter, publicProcedure } from "./trpc";

export const appRouter = createTRPCRouter({
    health: publicProcedure.query(() => {
        return { status: "ok", timestamp: new Date().toISOString() };
    }),
});

export type AppRouter = typeof appRouter;
