import { createTRPCRouter, publicProcedure } from "./trpc";
import { userRouter } from "./routers/user";

export const appRouter = createTRPCRouter({
    health: publicProcedure.query(() => {
        return { status: "ok", timestamp: new Date().toISOString() };
    }),
    user: userRouter,
});

export type AppRouter = typeof appRouter;
