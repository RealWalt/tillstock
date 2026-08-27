import { HydrateClient } from "@/lib/server";
import { Suspense } from "react";
import { NewProductView } from "./_components/new_product_view";

export default function Page () {

    return (
        <HydrateClient>
            <Suspense fallback={<p>Cargando...</p>}>
                <NewProductView />
            </Suspense>
        </HydrateClient>
    )
}