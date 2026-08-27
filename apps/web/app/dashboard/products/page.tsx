import { HydrateClient, trpc } from "@/lib/server";
import { Suspense } from "react";
import { ProductsView } from "./_components/products_view";

export default async function Page () {

    void trpc.category.list.prefetch({ page: 1, limit: 100, type: 'product'})
    void trpc.supplier.list.prefetch({ page: 1, limit: 100, status: 'active'})


    return (
        <HydrateClient>
            <Suspense fallback={<p>Cargando...</p>}>
                <ProductsView />
            </Suspense>
        </HydrateClient>
    )
}