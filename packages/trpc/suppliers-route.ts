import { z } from "zod";
import { protectedProcedure, router } from "./init.ts";
import { db } from "@repo/db";
import { businesses, suppliers } from "@repo/db/schema";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getUserBusiness } from "./get-user-business.ts";
import { requirePermission } from "./require-permission.ts";

export const suppliersRouter = router({
    create: requirePermission('create_suppliers')
    .input(z.object({
        name: z.string().min(1, 'El nombre es obligatorio'),
        contactName: z.string().optional(),
        description: z.string().optional(),
        phone: z.string(),
        email: z.string().optional(),
        ruc: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
        const [supplier] = await db
        .insert(suppliers).values({
            ...input,
            businessId: ctx.business.id
        }).returning();

        return supplier;
    }),

    list: protectedProcedure
    .input(z.object({
        status: z.enum(['all', 'active', 'inactive']).default('all'),
        page: z.number().default(1),
        search: z.string().optional(),
        limit: z.number().default(10)
    }))
    .query(async ({ ctx, input }) => {
        const { status, page, search, limit } = input;

        const searchFilter = search
            ? ilike(suppliers.name, `%${search}%`)
            : undefined;

            const statusFilter = 
            status === 'active' ? eq(suppliers.isActive, true) :
            status === 'inactive' ? eq(suppliers.isActive, false) :
            undefined 

            const result = await getUserBusiness(ctx.session.user.id)
            if (!result) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'No tenés acceso a ningún negocio' })
            }
            const { business } = result

            const baseWhere = and(
                eq(suppliers.businessId, business.id),
                searchFilter,
                statusFilter
            )

            const [totalResult] = await db
            .select({ total: count() })
            .from(suppliers)
            .innerJoin(businesses, eq(businesses.id, suppliers.businessId))
            .where(baseWhere)

            const total = totalResult?.total ?? 0

            const data = await db
            .select({
                id: suppliers.id,
                name: suppliers.name,
                contactName: suppliers.contactName,
                description: suppliers.description,
                phone: suppliers.phone,
                email: suppliers.email,
                ruc: suppliers.ruc,
                isActive: suppliers.isActive,
                createdAt: suppliers.createdAt
            })
            .from(suppliers)
            .innerJoin(businesses, eq(businesses.id, suppliers.businessId))
            .where(baseWhere)
            .orderBy(desc(suppliers.createdAt))
            .limit(limit)
            .offset((page - 1) * limit)

            return {
                items: data,
                total,
                totalPages: Math.ceil(total / limit)
            }
    }),

    update: requirePermission('edit_suppliers')
    .input(z.object({
        id: z.uuid(),
        name: z.string().min(1, 'El nombre es obligatorio'),
        contactName: z.string().optional(),
        description: z.string().optional(),
        phone: z.string(),
        email: z.string().optional(),
        ruc: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
        const { id, ...values } = input;

        const [supplier] = await db
        .update(suppliers)
        .set({ ...values, updatedAt: new Date() })
        .where(and(
            eq(suppliers.id, id),
            eq(suppliers.businessId, ctx.business.id)
        ))
        .returning();

        if(!supplier) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Proveedor no encontrado'
            })
        }

        return supplier;
    }),

    delete: requirePermission('delete_suppliers')
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ input, ctx }) => {
        const [supplier] = await db
        .update(suppliers)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(
            eq(suppliers.id, input.id),
            eq(suppliers.businessId, ctx.business.id)
        ))
        .returning();

        if(!supplier) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Proveedor no encontrado'
            })
        }

        return supplier;
    })
})