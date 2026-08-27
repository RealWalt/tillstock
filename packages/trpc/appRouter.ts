import { businessRouter } from "./business-router.ts";
import { categoryRouter } from "./category-router.ts";
import { router } from "./init.ts";
import { productRouter } from "./product-router.ts";
import { suppliersRouter } from "./suppliers-route.ts";

export const appRouter = router({
    business: businessRouter,
    category: categoryRouter,
    supplier: suppliersRouter,
    product: productRouter
})

export type AppRouter = typeof appRouter
