import { z } from "zod";
import { publicProcedure, router } from ".";

export const appRouter = router({
    hello: publicProcedure
    .input(z.object({
        text: z.string()
    }))
    .query(({ input}) => {
        return `Hola ${input.text}`
    })
})

export type AppRouter = typeof appRouter
