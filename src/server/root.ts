import { createTRPCRouter, publicProcedure } from "./trpc";
import { userRouter } from "./routers/user";
import { learningRouter } from "./routers/learning";
import { courseRouter } from "./routers/course";
import { leagueRouter } from "./routers/league";
import { questRouter } from "./routers/quest";
import { adminRouter } from "./routers/admin";
import { creatorRouter } from "./routers/creator";
import { devRouter } from "./routers/dev";

export const appRouter = createTRPCRouter({
    health: publicProcedure.query(() => {
        return { status: "ok", timestamp: new Date().toISOString() };
    }),
    user: userRouter,
    learning: learningRouter,
    course: courseRouter,
    league: leagueRouter,
    quest: questRouter,
    admin: adminRouter,
    creator: creatorRouter,
    dev: devRouter,
});

export type AppRouter = typeof appRouter;
