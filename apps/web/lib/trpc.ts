import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter } from "@repo/trpc/appRouter"


export const api: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>();

