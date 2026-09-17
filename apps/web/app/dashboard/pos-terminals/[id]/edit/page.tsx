import { HydrateClient, trpc } from "@/lib/server";
import { Suspense } from "react";
import { EditPosTerminalView } from "./_components/edit_pos_terminal_view";

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
    const { id } = await params

    void trpc.posTerminals.getById.prefetch({ id })

    return (
        <HydrateClient>
            <Suspense fallback={<p>Cargando...</p>}>
                <EditPosTerminalView terminalId={id} />
            </Suspense>
        </HydrateClient>
    )
}
