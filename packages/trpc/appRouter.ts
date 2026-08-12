import { businessRouter } from "./business-router.ts";
import { categoryRouter } from "./category-router.ts";
import { router } from "./init.ts";

export const appRouter = router({
    business: businessRouter,
    category: categoryRouter
})

export type AppRouter = typeof appRouter
