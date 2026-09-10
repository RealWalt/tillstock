import { HydrateClient, trpc } from "@/lib/server";
import { Suspense } from "react";
import { NewProductView } from "./_components/new_product_view";

export default async function Page () {
    void trpc.supplier.list.prefetch({ page: 1, limit: 100, search: undefined, status: 'active' })
    void trpc.category.list.prefetch({ page: 1, limit: 100, type: 'product'})


    return (
        <HydrateClient>
            <Suspense fallback={<p>Cargando...</p>}>
                <NewProductView />
            </Suspense>
        </HydrateClient>
    )
}