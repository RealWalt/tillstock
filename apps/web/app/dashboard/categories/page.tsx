import { HydrateClient } from "@/lib/server";
import { Suspense } from "react";
import { CategoriesView } from "./_components/categories_view";
import { trpc } from "@/lib/server"
import { PAGE_SIZE } from "./constants"

type PageProps = {
    searchParams: Promise<{ page?: string; search?: string; type?: string }>
}

export default async function Page ({ searchParams }: PageProps) {
    const params = await searchParams
    const page = Number(params.page ?? 1)
    const search = params.search || undefined
    const type = params.type && params.type !== "all" ? (params.type as "product" | "service") : undefined

    void trpc.category.list.prefetch({ page, limit: PAGE_SIZE, search, type })
    return (
        <HydrateClient>
            <Suspense fallback={<p>Cargando...</p>}>
                <CategoriesView />
            </Suspense>
        </HydrateClient>
    )
}