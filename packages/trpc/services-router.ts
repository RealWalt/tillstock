import { z } from "zod";
import { protectedProcedure, router } from "./init.ts";
import { db } from "@repo/db";
import { businesses, products, services } from "@repo/db/schema";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getUserBusiness } from "./get-user-business.ts";
import { requirePermission } from "./require-permission.ts";

export const servicesRouter = router({
    getById: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
        const result = await getUserBusiness(ctx.session.user.id)
        if (!result) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'No tenés acceso a ningún negocio' })
        }
        const { business } = result

        const [service] = await db
        .select()
        .from(services)
        .where(and(
            eq(services.id, input.id),
            eq(services.businessId, business.id)
        ))

        if(!service) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Servicio no encontrado'
            })
        }

        return service
    }),

    create: requirePermission('create_services')
    .input(z.object({
        name: z.string().min(1, 'Nombre Invalido'),
        description: z.string().optional(),
        price: z.number().min(1, 'Precio invalido'),
        duration: z.number().min(1, 'Duracion invalida'), // en minutos
        categoryId: z.string().optional(),
        imageUrl: z.string().optional(),
    })).mutation(async ({ ctx, input}) => {
        const [service] = await db
        .insert(services)
        .values({
            ...input,
            businessId: ctx.business.id,
        }).returning()

        return service;
    }),
    
    list: protectedProcedure
    .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        categoryId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
        const {page, limit, search, categoryId } = input 

        const searchFilter = search 
        ?   ilike(services.name, `%${search}%`) 
        : undefined

        const categoryFilter = categoryId
        ? eq(services.categoryId, categoryId)
        : undefined

        const result = await getUserBusiness(ctx.session.user.id)
        if (!result) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'No tenés acceso a ningún negocio' })
        }
        const { business } = result

        const baseWhere = and(
            eq(services.businessId, business.id),
            categoryFilter,
            searchFilter
        )

        const [totalResult] = await db
        .select({
            total: count()
        })
        .from(services)
        .innerJoin(businesses, eq(businesses.id, services.businessId))
        .where(baseWhere)

        const total = Number(totalResult?.total ?? 0)

        const data = await db
        .select({
            id: services.id,
            name: services.name,
            description: services.description,
            imageUrl: services.imageUrl,
            price: services.price,
            duration: services.duration,
            isActive: services.isActive,
            categoryId: services.categoryId,
            createdAt: services.createdAt,
        })
        .from(services)
        .innerJoin(businesses, eq(businesses.id, services.businessId))
        .where(baseWhere)
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(desc(services.createdAt))

        return {
            items: data,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }),

    update: requirePermission('edit_services')
    .input(z.object({
        id: z.uuid(),
        name: z.string().min(1, 'Nombre Invalido'),
        description: z.string().optional(),
        duration: z.number().min(1, 'El servicio debe durar al menos un minuto'),
        price: z.number().min(1, 'Precio invalido'),
        categoryId: z.uuid().optional(),
        isActive: z.boolean().default(true),
        imageUrl: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
        const { id, ...values} = input

        const [service] = await db
        .update(services)
        .set({ ...values, updatedAt: new Date()})
        .where(and(
            eq(services.id, id),
            eq(services.businessId, ctx.business.id)
        ))
        .returning()

        if(!service) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Servicio no encontrado'
            })
        }

        return service
    }),

    delete: requirePermission('delete_services')
    .input(z.object({
        id: z.uuid()
    }))
    .mutation(async ({ ctx, input }) => {
        const [service] = await db
        .update(services)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(
            eq(services.id, input.id),
            eq(services.businessId, ctx.business.id)
        ))
        .returning()

        if(!service) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Servicio no encontrado'
            })
        }

        return service
    })
})