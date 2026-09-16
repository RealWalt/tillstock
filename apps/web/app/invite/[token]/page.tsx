import { HydrateClient, trpc } from "@/lib/server";
import { InvitationView } from "../_components/invitation_view";
import { Suspense } from "react";

type PageProps = {
    params: Promise<{ token: string }>
}

export default async function Page({ params }: PageProps) {
    const { token } = await params;

    void trpc.businessInvitations.getByToken.prefetch({ token })

    return (
        <HydrateClient>
            <Suspense fallback={<div>Cargando...</div>}>
                <InvitationView token={token} />
            </Suspense>
        </HydrateClient>
    )
}