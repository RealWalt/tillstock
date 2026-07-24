import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from '@repo/trpc/appRouter'
import { auth } from "@/lib/auth"

const handler = (req: Request) => {
    return fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext: async () => {
            const session = await auth.api.getSession({ headers: req.headers })
            return { session }
        },

    })
}

export { handler as GET, handler as POST };