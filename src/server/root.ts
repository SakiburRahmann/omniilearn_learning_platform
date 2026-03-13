import { createTRPCRouter, publicProcedure } from "./trpc";
import { userRouter } from "./routers/user";
import { learningRouter } from "./routers/learning";
import { courseRouter } from "./routers/course";

export const appRouter = createTRPCRouter({
    health: publicProcedure.query(() => {
        return { status: "ok", timestamp: new Date().toISOString() };
    }),
    user: userRouter,
    learning: learningRouter,
    course: courseRouter,
});

export type AppRouter = typeof appRouter;
