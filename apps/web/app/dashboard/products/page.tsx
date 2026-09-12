import { HydrateClient, trpc } from "@/lib/server";
import { Suspense } from "react";
import { ProductsView } from "./_components/products_view";
import { PAGE_SIZE } from "@/lib/constants";

type PageProps = {
    searchParams: Promise<{ page?: string; search?: string; categoryId?: string; supplierId?: string }>
}

export default async function Page ({ searchParams }: PageProps) {
    const params = await searchParams
    const page = Number(params.page ?? 1)
    const search = params.search || undefined
    const categoryId = params.categoryId && params.categoryId !== "all" ? params.categoryId : undefined
    const supplierId = params.supplierId && params.supplierId !== "all" ? params.supplierId : undefined

    void trpc.product.list.prefetch({ page, limit: PAGE_SIZE, search, categoryId, supplierId })
    void trpc.category.list.prefetch({ page: 1, limit: 100, type: 'product' })
    void trpc.supplier.list.prefetch({ page: 1, limit: 100, status: 'active' })

    return (
        <HydrateClient>
            <Suspense fallback={<p>Cargando...</p>}>
                <ProductsView />
            </Suspense>
        </HydrateClient>
    )
}
