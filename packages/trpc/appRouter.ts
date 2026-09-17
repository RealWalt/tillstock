import { businessInvitationRouter, businessMembersRouter, businessRouter } from "./business-router.ts";
import { categoryRouter } from "./category-router.ts";
import { router } from "./init.ts";
import { posTerminalOperatorsRouter } from "./pos-terminal-operators-router.ts";
import { posTerminalRouter } from "./posTerminal-router.ts";
import { productRouter } from "./product-router.ts";
import { rolesRouter } from "./roles-router.ts";
import { servicesRouter } from "./services-router.ts";
import { suppliersRouter } from "./suppliers-route.ts";

export const appRouter = router({
    business: businessRouter,
    category: categoryRouter,
    supplier: suppliersRouter,
    product: productRouter,
    services: servicesRouter,
    roles: rolesRouter,
    businessMembers: businessMembersRouter,
    businessInvitations: businessInvitationRouter,
    posTerminals: posTerminalRouter,
    posTerminalOperators: posTerminalOperatorsRouter,
})

export type AppRouter = typeof appRouter
