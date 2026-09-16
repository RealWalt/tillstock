import { HydrateClient, trpc } from "@/lib/server";
import { Suspense } from "react";
import { EmployeeProfileView } from "./_components/employee_profile_view";

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
    const { id } = await params

    void trpc.businessMembers.getById.prefetch({ id })

    return (
        <HydrateClient>
            <Suspense fallback={<p>Cargando...</p>}>
                <EmployeeProfileView employeeId={id} />
            </Suspense>
        </HydrateClient>
    )
}
