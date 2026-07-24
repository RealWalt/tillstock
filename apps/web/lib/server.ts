import "server-only"
import { createHydrationHelpers } from "@trpc/react-query/rsc"
import { cache } from "react"
import { createCallerFactory, createTRPCContext } from "@repo/trpc/init"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { makeQueryClient } from "./query-client"
import { appRouter } from "@repo/trpc/appRouter"

export const getQueryClient = cache(makeQueryClient)

const caller = createCallerFactory(appRouter)(async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  return createTRPCContext({ session })
})

// NOTE: 'as any' is required due to a known TypeScript monorepo bug.
// Bun resolves package symlinks in a way that makes TS unable to infer
// the type of 'trpc'/'HydrateClient' portably (error TS2742).
// See: https://github.com/microsoft/TypeScript/issues/42873
// The runtime type is still correct — this only suppresses the compile-time error.

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient,
);