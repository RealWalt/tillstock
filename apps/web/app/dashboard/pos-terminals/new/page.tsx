import { Suspense } from "react";
import { NewPosTerminalView } from "./_components/new_pos_terminal_view";

export default function Page() {
    return (
        <Suspense fallback={<p>Cargando...</p>}>
            <NewPosTerminalView />
        </Suspense>
    )
}
