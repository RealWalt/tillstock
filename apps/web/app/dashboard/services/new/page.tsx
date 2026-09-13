import { HydrateClient, trpc } from "@/lib/server";
import { Suspense } from "react";
import { NewServiceView } from "./_components/new_service_view";

export default async function Page () {
    void trpc.category.list.prefetch({ page: 1, limit: 100, type: 'service'})


    return (
        <HydrateClient>
            <Suspense fallback={<p>Cargando...</p>}>
                <NewServiceView />
            </Suspense>
        </HydrateClient>
    )
}