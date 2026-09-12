import { z } from "zod";
import { protectedProcedure, router } from "./init.ts";
import { db } from "@repo/db";
import { businesses, products } from "@repo/db/schema";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { TRPCError } from "@trpc/server";   

export const productRouter = router({
    create: protectedProcedure
    .input(z.object({
        name: z.string().min(1, 'Nombre Invalido'),
        description: z.string().optional(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        imageUrl: z.string().optional(),
        stock: z.number().min(0, 'El stock no puede ser negativo'),
        salePrice: z.number().min(1, 'Precio de venta invalido'),
        purchasePrice: z.number().min(1, 'Precio de compra'),
        categoryId: z.uuid().optional(),
        supplierId: z.uuid().optional()
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
        let finalSku = input.sku;
        if(!finalSku) {
            const [total] = await db
            .select({
                total: count()
            }).from(products)
            .where(eq(products.businessId, business.id))

            const totalResult = Number(total?.total ?? 0);

            finalSku = String(totalResult + 1)
        }

        function generateBarcode() : string {
            const timestamp = Date.now().toString().slice(-8)
            const randomDigits = Math.floor(Math.random() * 900 + 100)
            return `${timestamp +   4}${randomDigits}`
        }

        

        const [product] = await db
        .insert(products)
        .values({
            ...input,
            barcode: input.barcode || generateBarcode(),
            sku: finalSku,
            businessId: business.id
        }).returning()

        return product
    }),

    list: protectedProcedure
    .input(z.object({
        limit: z.number().default(10),
        page: z.number().default(1),
        search: z.string().optional(),
        categoryId: z.string().optional(),
        supplierId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
        const { limit, page, search, categoryId, supplierId } = input;

        const searchFilter = search
            ? ilike(products.name, `%${search}%`)
            : undefined;

        const categoryFilter = categoryId
            ? eq(products.categoryId, categoryId)
            : undefined;
        
        const supplieFilter = supplierId
            ? eq(products.supplierId, supplierId)
            : undefined;

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
            eq(products.businessId, business.id),
            eq(businesses.ownerId, ctx.session.user.id),
            searchFilter,
            categoryFilter,
            supplieFilter
        )

        const [totalResult] = await db
        .select({
            total: count()
        })
        .from(products)
        .innerJoin(businesses, eq(businesses.id, products.businessId))  
        .where(baseWhere)

        const total = Number(totalResult?.total ?? 0);

        const data = await db
        .select({
            id: products.id,
            name: products.name,
            description: products.description,
            sku: products.sku,
            barcode: products.barcode,
            imageUrl: products.imageUrl,
            stock: products.stock,
            isActive: products.isActive,
            salePrice: products.salePrice,
            purchasePrice: products.purchasePrice,
            categoryId: products.categoryId,
            supplierId: products.supplierId
        })
        .from(products)
        .innerJoin(businesses, eq(businesses.id, products.businessId))
        .where(baseWhere)
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(desc(products.createdAt))

        return {
            items: data,
            total,
            totalPages: Math.ceil(total / limit),
        }

    }),

    update: protectedProcedure
    .input(z.object({
        id: z.uuid(),
        name: z.string().min(1, 'Nombre Invalido'),
        description: z.string().optional(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        imageUrl: z.string().optional(),
        stock: z.number().min(0, 'El stock no puede ser negativo'),
        salePrice: z.number().min(1, 'Precio de venta invalido'),
        purchasePrice: z.number().min(1, 'Precio de compra'),
        categoryId: z.uuid().optional(),
        supplierId: z.uuid().optional()
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

        const [product] = await db
        .update(products)
        .set({ ...values, updatedAt: new Date() })
        .where(and(
            eq(products.id, id),
            eq(products.businessId, business.id)
        ))
        .returning()

        if(!product) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Producto no encontrado'
            })
        }

        return product
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

        const [product] = await db
        .update(products)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(
            eq(products.id, input.id),
            eq(products.businessId, business.id)
        ))
        .returning()

        if(!product) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Producto no encontrado'
            })
        }

        return product
    })
})