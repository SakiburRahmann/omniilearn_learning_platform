import { createTRPCRouter, publicProcedure } from "./trpc";
import { userRouter } from "./routers/user";
import { learningRouter } from "./routers/learning";
import { courseRouter } from "./routers/course";
import { leagueRouter } from "./routers/league";
import { questRouter } from "./routers/quest";

export const appRouter = createTRPCRouter({
    health: publicProcedure.query(() => {
        return { status: "ok", timestamp: new Date().toISOString() };
    }),
    user: userRouter,
    learning: learningRouter,
    course: courseRouter,
    league: leagueRouter,
    quest: questRouter,
});

export type AppRouter = typeof appRouter;
