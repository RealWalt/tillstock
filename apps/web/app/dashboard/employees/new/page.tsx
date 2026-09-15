import { HydrateClient, trpc } from "@/lib/server";
import { Suspense } from "react";
import { NewEmployeeView } from "./_components/new_employee_view";

export default async function Page() {
    void trpc.roles.list.prefetch({ page: 1, limit: 100 })

    return (
        <HydrateClient>
            <Suspense fallback={<p>Cargando...</p>}>
                <NewEmployeeView />
            </Suspense>
        </HydrateClient>
    )
}
