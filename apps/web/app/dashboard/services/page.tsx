import { HydrateClient } from "@/lib/server";
import { Suspense } from "react";
import { ServicesView } from "./_components/services_view";

export default function Page() {


    return (
        <HydrateClient>
            <Suspense fallback={<div>Loading...</div>}>
                <ServicesView />
            </Suspense>
        </HydrateClient>
    )
}