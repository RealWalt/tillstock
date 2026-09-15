import { HydrateClient, trpc } from "@/lib/server";
import { Suspense } from "react";
import { EmpleadosView } from "./_components/empleados_view";
import { PAGE_SIZE } from "@/lib/constants";

type PageProps = {
    searchParams: Promise<{ page?: string; search?: string }>
}

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams
    const page = Number(params.page ?? 1)
    const search = params.search || undefined

    void trpc.businessMembers.list.prefetch({ page, limit: PAGE_SIZE, search })

    return (
        <HydrateClient>
            <Suspense fallback={<div>Loading...</div>}>
                <EmpleadosView />
            </Suspense>
        </HydrateClient>
    )
}
