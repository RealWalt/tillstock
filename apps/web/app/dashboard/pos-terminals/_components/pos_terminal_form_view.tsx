'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/trpc"
import { CloudUpload, Copy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

const terminalSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
})

export type TerminalFormData = {
    id: string
    name: string
    status: 'pending' | 'active' | 'revoked'
    keyId: string | null
}

const statusBadge: Record<TerminalFormData['status'], { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-orange-100 text-orange-800' },
    active: { label: 'Activo', className: 'bg-green-100 text-green-800' },
    revoked: { label: 'Revocado', className: 'bg-red-100 text-red-800' },
}

type PosTerminalFormViewProps = {
    mode: 'create' | 'edit'
    terminal?: TerminalFormData
}

export const PosTerminalFormView = ({ mode, terminal }: PosTerminalFormViewProps) => {
    const router = useRouter()

    const [name, setName] = useState(terminal?.name ?? '')

    const utils = api.useUtils()

    const { mutate: createTerminal, isPending: isCreating } = api.posTerminals.create.useMutation({
        onSuccess: () => {
            utils.posTerminals.list.invalidate()
            toast.success('Caja creada correctamente')
            router.push('/dashboard/pos-terminals')
        },
        onError: (error) => {
            toast.error('Error al crear la caja: ' + error.message)
        }
    })

    const { mutate: updateTerminal, isPending: isUpdating } = api.posTerminals.update.useMutation({
        onSuccess: () => {
            utils.posTerminals.list.invalidate()
            utils.posTerminals.getById.invalidate({ id: terminal?.id })
            toast.success('Caja actualizada correctamente')
            router.push('/dashboard/pos-terminals')
        },
        onError: (error) => {
            toast.error('Error al actualizar la caja: ' + error.message)
        }
    })

    const isPending = mode === 'create' ? isCreating : isUpdating

    const handleCopyKey = async (keyId: string) => {
        try {
            await navigator.clipboard.writeText(keyId)
            toast.success('Key copiada al portapapeles')
        } catch {
            toast.error('No se pudo copiar la key')
        }
    }

    const handleSubmit = () => {
        const result = terminalSchema.safeParse({ name })

        if (!result.success) {
            const errorMessage = result.error.issues[0]?.message
            toast.error(`Error al ${mode === 'create' ? 'crear' : 'actualizar'} la caja: ` + errorMessage)
            return
        }

        if (mode === 'create') {
            createTerminal(result.data)
        } else if (terminal) {
            updateTerminal({ id: terminal.id, ...result.data })
        }
    }

    return (
        <div className="px-6 sm:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-gray-900 font-semibold text-xl leading-tight">
                        {mode === 'create' ? 'Nueva caja' : 'Editar caja'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {mode === 'create'
                            ? 'Completa la información para agregar una nueva caja registradora'
                            : 'Actualizá la información de tu caja'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant='primary' disabled={isPending} onClick={handleSubmit}>
                        <CloudUpload className="h-4 w-4" />
                        {mode === 'create' ? 'Crear caja' : 'Guardar cambios'}
                    </Button>
                </div>
            </div>

            <div className="max-w-md space-y-6">
                <div className="space-y-3">
                    <Label>Nombre de la caja <span className="text-red-600 font-bold">*</span></Label>
                    <Input
                        placeholder="Ej: Caja 1, Mostrador principal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {mode === 'edit' && terminal && (
                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">Información de conexión</h4>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Estado</span>
                            <Badge className={statusBadge[terminal.status].className}>
                                {statusBadge[terminal.status].label}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Key</span>
                            {terminal.keyId ? (
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-xs bg-gray-100 rounded px-2 py-1">{terminal.keyId}</span>
                                    <Button variant='ghost' size='icon-sm' onClick={() => handleCopyKey(terminal.keyId!)}>
                                        <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                <span className="text-sm text-muted-foreground">Sin generar</span>
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                            La generación y el reseteo de la key se manejan desde la lista de cajas.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
