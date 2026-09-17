'use client'

import { api } from "@/lib/trpc"
import { PosTerminalFormView } from "../../../_components/pos_terminal_form_view"

type EditPosTerminalViewProps = {
    terminalId: string
}

export const EditPosTerminalView = ({ terminalId }: EditPosTerminalViewProps) => {
    const [terminal] = api.posTerminals.getById.useSuspenseQuery({ id: terminalId })

    return <PosTerminalFormView mode='edit' terminal={terminal} />
}
