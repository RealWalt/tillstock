import { HydrateClient, trpc } from "@/lib/server";
import { Suspense } from "react";
import { EditProductView } from "./_components/edit_product_view";

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
    const { id } = await params

    void trpc.product.getById.prefetch({ id })
    void trpc.supplier.list.prefetch({ page: 1, limit: 100, search: undefined, status: 'active' })
    void trpc.category.list.prefetch({ page: 1, limit: 100, type: 'product' })

    return (
        <HydrateClient>
            <Suspense fallback={<p>Cargando...</p>}>
                <EditProductView productId={id} />
            </Suspense>
        </HydrateClient>
    )
}
