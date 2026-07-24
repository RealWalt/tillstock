import { businessRouter } from "./business-router.ts";
import { router } from "./init.ts";

export const appRouter = router({
    business: businessRouter
})

export type AppRouter = typeof appRouter
