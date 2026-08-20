import { HydrateClient, trpc } from "@/lib/server";
import { Suspense } from "react";
import { SuppliersView } from "./_components/suppliers_view";
import { PAGE_SIZE } from "@/lib/constants";

type PageProps = {
    searchParams: Promise<{ page?: string; search?: string; status?: string }>
}

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams
    const page = Number(params.page ?? 1)
    const search = params.search || undefined
    const status = params.status && params.status !== "all" ? (params.status as "active" | "inactive") : undefined

    void trpc.supplier.list.prefetch({ page, limit: PAGE_SIZE, search, status })
    return (
        <HydrateClient>
            <Suspense fallback={<p>Loading...</p>}>
                <SuppliersView />
            </Suspense>
        </HydrateClient>
    )
}