import { z } from "zod";
import { protectedProcedure, router } from "./init.ts";
import { db } from "@repo/db";
import { businesses, services } from "@repo/db/schema";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const servicesRoute = router({
    create: protectedProcedure
    .input(z.object({
        name: z.string().min(1, 'Nombre Invalido'),
        description: z.string().optional(),
        price: z.number().min(1, 'Precio invalido'),
        duration: z.number().min(1, 'Duracion invalida'), // en minutos
        categoryId: z.string().optional(),
        imageUrl: z.string().optional(),
    })).mutation(async ({ ctx, input}) => {
        const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.ownerId, ctx.session.user.id))

        if(!business) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'No se encontro el negocio' })
        }

        const [service] = await db
        .insert(services)
        .values({
            ...input,
            businessId: business.id,
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

        const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.ownerId, ctx.session.user.id))

        if(!business) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'No se encontro el negocio' })
        }

        const baseWhere = and(
            eq(services.businessId, business.id),
            eq(businesses.ownerId, ctx.session.user.id),
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
        
    })
})