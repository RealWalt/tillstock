import { HydrateClient, trpc } from "@/lib/server";
import { Suspense } from "react";
import { PosTerminalsView } from "./_components/pos_terminals_view";

export default async function Page() {
    void trpc.posTerminals.list.prefetch()

    return (
        <HydrateClient>
            <Suspense fallback={<div>Loading...</div>}>
                <PosTerminalsView />
            </Suspense>
        </HydrateClient>
    )
}
