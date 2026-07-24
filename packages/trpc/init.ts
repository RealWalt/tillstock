import { initTRPC, TRPCError } from "@trpc/server";

export interface Context {
    session: {
        user: { id: string}
    } | null
}
export const createTRPCContext = async (opts?: { session: Context['session']}) => {
    return {
        session: opts?.session ?? null
    }
}
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next}) => {
    if(!ctx.session) {
        throw new TRPCError({
            code: 'UNAUTHORIZED'})
    }

    return next({ ctx: { session: ctx.session}})
})
