import { z } from "zod";
import { protectedProcedure, router } from "./init.ts";
import { db } from "@repo/db";
import { businesses, products } from "@repo/db/schema";
import { eq } from "drizzle-orm";
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

        const [product] = await db
        .insert(products)
        .values({
            ...input,
            businessId: business.id
        }).returning()

        return product
    })
})