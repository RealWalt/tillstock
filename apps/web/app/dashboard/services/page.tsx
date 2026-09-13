import { HydrateClient, trpc } from "@/lib/server";
import { Suspense } from "react";
import { ServicesView } from "./_components/services_view";
import { PAGE_SIZE } from "@/lib/constants";

type PageProps = {
    searchParams: Promise<{ page?: string; search?: string; categoryId?: string; }>
}

export default async function Page({ searchParams }: PageProps) {

    const params = await searchParams
    const page = Number(params.page ?? 1)
    const search = params.search || undefined
    const categoryId = params.categoryId && params.categoryId !== "all" ? params.categoryId : undefined

    void trpc.category.list.prefetch({ page: 1, limit: 100, type: 'service' })
    void trpc.services.list.prefetch({ page , limit: PAGE_SIZE, search, categoryId})

    return (
        <HydrateClient>
            <Suspense fallback={<div>Loading...</div>}>
                <ServicesView />
            </Suspense>
        </HydrateClient>
    )
}