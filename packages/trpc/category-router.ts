import { z } from "zod";
import { protectedProcedure, router } from "./init.ts";
import { db } from "@repo/db";
import { businesses, categories } from "@repo/db/schema";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const categoryRouter = router({
    create: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            type: z.enum(['product', 'service']),
            color: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
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

            const [category] = await db.insert(categories).values({
                ...input,
                businessId: business.id,
            }).returning();

            return category;
        }),

    list: protectedProcedure
        .input(z.object({
            type: z.enum(['product', 'service']).optional(),
            page: z.number().default(1),
            search: z.string().optional(),
            limit: z.number().default(10)
        }))
        .query(async ({ ctx, input }) => {
            const { type, search, page, limit} = input;
            const searchFilter = search 
                ? ilike(categories.name, `%${search}%`) 
                : undefined;

            const typeFilter = type ? eq(categories.type, type) : undefined

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
                eq(categories.businessId, business.id),
                eq(businesses.ownerId, ctx.session.user.id),
                searchFilter,
                typeFilter
            )
            
            const [totalResult] = await db
            .select({ total: count()})
            .from(categories)
            .innerJoin(businesses, eq(businesses.id, categories.businessId))
            .where(baseWhere)

            const total = totalResult?.total ?? 0


            const data = await db
            .select({
                id: categories.id,
                name: categories.name,
                description: categories.description,
                type: categories.type,
                color: categories.color,
                isActive: categories.isActive,
                createdAt: categories.createdAt,
            })
            .from(categories)
            .innerJoin(businesses, eq(businesses.id, categories.businessId))
            .where(baseWhere)
            .orderBy(desc(categories.createdAt))
            .limit(limit)
            .offset((page - 1) * limit)

            return {
                items: data,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.uuid(),
            name: z.string().min(1),
            description: z.string().optional(),
            type: z.enum(['product', 'service']),
            color: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, ...values } = input;

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

            const [category] = await db
            .update(categories)
            .set({ ...values, updatedAt: new Date() })
            .where(and(
                eq(categories.id, id),
                eq(categories.businessId, business.id)
            ))
            .returning();

            if(!category) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Categoría no encontrada'
                })
            }

            return category;
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.uuid() }))
        .mutation(async ({ ctx, input }) => {
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

            const [category] = await db
            .update(categories)
            .set({ isActive: false, updatedAt: new Date() })
            .where(and(
                eq(categories.id, input.id),
                eq(categories.businessId, business.id)
            ))
            .returning();

            if(!category) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Categoría no encontrada'
                })
            }

            return category;
        })
})