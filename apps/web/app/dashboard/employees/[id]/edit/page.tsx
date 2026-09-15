import { HydrateClient, trpc } from "@/lib/server";
import { Suspense } from "react";
import { EditEmployeeView } from "./_components/edit_employee_view";

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
    const { id } = await params

    void trpc.businessMembers.getById.prefetch({ id })
    void trpc.roles.list.prefetch({ page: 1, limit: 100 })

    return (
        <HydrateClient>
            <Suspense fallback={<p>Cargando...</p>}>
                <EditEmployeeView employeeId={id} />
            </Suspense>
        </HydrateClient>
    )
}
