import { HydrateClient, trpc } from "@/lib/server";
import { Suspense } from "react";
import { EditServiceView } from "./_components/edit_service_view";

type PageProps = {
    params: Promise<{ id: string }>
}
export default async function Page ({ params } : PageProps) {
    const { id } = await params

    void trpc.services.getById.prefetch({ id })
    void trpc.category.list.prefetch({ page: 1, limit: 100, type: 'service' })

    return (
        <HydrateClient>
            <Suspense fallback={<p>Cargando...</p>}>
                <EditServiceView serviceId={id} /> 
            </Suspense>
        </HydrateClient>
    )
}