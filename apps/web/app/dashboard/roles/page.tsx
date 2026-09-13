import { HydrateClient, trpc } from "@/lib/server";
import { Suspense } from "react";
import { RolesView } from "./_components/roles_view";

export default async function Page () {
    void trpc.roles.list.prefetch({ page: 1, limit: 100, search: undefined })
    void trpc.roles.getAvailablePermissions.prefetch()

    return (
        <HydrateClient>
            <Suspense fallback={<p>Cargando...</p>}>
                <RolesView />
            </Suspense>
        </HydrateClient>
    )
}