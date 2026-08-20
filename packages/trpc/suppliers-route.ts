import { z } from "zod";
import { protectedProcedure, router } from "./init.ts";
import { db } from "@repo/db";
import { businesses, suppliers } from "@repo/db/schema";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const suppliersRouter = router({
    create: protectedProcedure
    .input(z.object({
        name: z.string().min(1, 'El nombre es obligatorio'),
        contactName: z.string().optional(),
        description: z.string().optional(),
        phone: z.string(),
        email: z.string().optional(),
        ruc: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
        const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.ownerId, ctx.session.user.id))

        if(!business) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'No tienes ningun negocio creado'
            })
        }

        const [supplier] = await db
        .insert(suppliers).values({
            ...input,
            businessId: business.id
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

            const [business] = await db
            .select()
            .from(businesses)
            .where(eq(businesses.ownerId, ctx.session.user.id))

            if(!business) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'No tienes ningun negocio creado'
                })
            }

            const baseWhere = and(
                eq(suppliers.businessId, business.id),
                eq(businesses.ownerId, ctx.session.user.id),
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
    })
})