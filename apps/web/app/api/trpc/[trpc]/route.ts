import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from '@repo/trpc/appRouter'

const handler = (req: Request) => {
    return fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext: () => ({}),

    })
}

export { handler as GET, handler as POST };