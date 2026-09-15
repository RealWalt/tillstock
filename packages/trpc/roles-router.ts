import { AVAILABLE_PERMISSIONS } from "@repo/db/permissions";
import { protectedProcedure, router } from "./init.ts";
import { db } from "@repo/db";
import { businesses, roles } from "@repo/db/schema";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { DEFAULT_ROLES } from "@repo/db/default_roles";
import { z } from "zod";
import { getUserBusiness } from "./get-user-business.ts";
import { requirePermission } from "./require-permission.ts";

export const rolesRouter = router({
    getAvailablePermissions: protectedProcedure
    .query(() => {
        return AVAILABLE_PERMISSIONS
    }),

    seedDefaults: requirePermission('manage_roles')
    .mutation(async ({ ctx }) => {
      const [existing] = await db
      .select({ total: count()})
      .from(roles)
      .where(eq(roles.businessId, ctx.business.id))

      if((existing?.total ?? 0) > 0) {
        return { seeded: false, message: 'Ya existen roles para este negocio'}
      }

      const inserted = await db.insert(roles).values(
        DEFAULT_ROLES.map((role) => ({
            ...role,
            businessId: ctx.business.id
        }))
      ).returning()

      return { seeded: true, roles: inserted}
    }),

    create: requirePermission('manage_roles')
    .input(z.object({
        name: z.string().min(1, 'El nombre es obligatorio'),
        description: z.string().optional(),
        permissions: z.array(z.string()).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
        const [role] = await db.insert(roles).values({
            ...input,
            businessId: ctx.business.id
        }).returning()

        return role
    }),

    update: requirePermission('manage_roles')
    .input(z.object({
        id: z.uuid(),
        name: z.string().min(1, 'El nombre es obligatorio').optional(),
        description: z.string().optional(),
        permissions: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
        const { id, ...values } = input;

        const [role] = await db
            .update(roles)
            .set({ ...values, updatedAt: new Date() })
            .where(and(
                eq(roles.id, id),
                eq(roles.businessId, ctx.business.id)
            ))
            .returning();

        if (!role) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Rol no encontrado' })
        }

        return role;
    }),

    list: protectedProcedure
    .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
    }))
    .query(async({ ctx, input }) => {
        const { page, limit, search } = input;

        const searchFilter = search ? ilike(roles.name, `%${search}%`) : undefined;

        const result = await getUserBusiness(ctx.session.user.id)
        if (!result) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'No tenés acceso a ningún negocio' })
        }
        const { business } = result

        const baseWhere = and(
            eq(roles.businessId, business.id),
            searchFilter,
        )
        
        const [totalResult] = await db
        .select({ total: count()})
        .from(roles)
        .innerJoin(businesses, eq(businesses.id, roles.businessId))
        .where(baseWhere)

        const total = Number(totalResult?.total ?? 0)

      const data = await db
        .select({
          id: roles.id,
          name: roles.name,
          description: roles.description,
          permissions: roles.permissions,
          isActive: roles.isActive,
          createdAt: roles.createdAt,
        })
        .from(roles)
        .innerJoin(businesses, eq(businesses.id, roles.businessId))
        .where(baseWhere)
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(desc(roles.createdAt))

        return {
            items: data,
            total,
            totalPages: Math.ceil(total / limit)
        }
    })
})