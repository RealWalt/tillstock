import { PermissionKey } from "@repo/db/permissions";
import { protectedProcedure } from "./init.ts";
import { db } from "@repo/db";
import { businesses, businessMembers, roles } from "@repo/db/schema";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const requirePermission = (permission: PermissionKey) => {
    return protectedProcedure.use(async ({ ctx, next }) => {
        const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.ownerId, ctx.session.user.id))

        if(business) {
            return next({ ctx: { ...ctx, business, isOwner: true } })
        }

        const [membership] = await db
        .select({
            businessId: businessMembers.businessId,
            permissions: roles.permissions
        })
        .from(businessMembers)
        .innerJoin(roles, eq(roles.id, businessMembers.roleId))
        .where(and(
            eq(businessMembers.userId, ctx.session.user.id),
            eq(businessMembers.isActive, true)
        ))

        if(!membership) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'No tenés acceso a ningún negocio'})
        }

        if(!membership.permissions.includes(permission)) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenés permisos para realizar esta acción' })
        }

        const [businessData] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, membership.businessId))

        return next({ ctx: { ...ctx, business: businessData, isOwner: false}})
    })
}