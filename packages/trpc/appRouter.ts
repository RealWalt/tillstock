import { businessRouter } from "./business-router.ts";
import { categoryRouter } from "./category-router.ts";
import { router } from "./init.ts";
import { suppliersRouter } from "./suppliers-route.ts";

export const appRouter = router({
    business: businessRouter,
    category: categoryRouter,
    supplier: suppliersRouter
})

export type AppRouter = typeof appRouter
