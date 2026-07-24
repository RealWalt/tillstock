import { z } from "zod";
import { protectedProcedure, router } from "./init.ts";
import { db } from '@repo/db'
import { businesses } from '@repo/db/schema'
import { eq } from "drizzle-orm"

export const businessRouter = router({
    create: protectedProcedure
    .input(z.object({
        name: z.string().min(1),
        type: z.enum(['products', 'services', 'mixed']),
        currency: z.enum(['PYG', 'USD', 'ARS', 'BRL']),
        description: z.string(),
        ruc: z.string(),
        phone: z.string(),
        logoUrl: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
        const [business] = await db.insert(businesses).values({
            ...input,
            ownerId: ctx.session.user.id
        }).returning()

        return business
    }),


    getMine: protectedProcedure
    .query(async ({ ctx }) => {
        const { user } = ctx.session;

        const [business] = await db
            .select()
            .from(businesses)
            .where(eq(businesses.ownerId, user.id)) 

        return business ?? null
    })
})