'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/trpc"
import { Copy, KeyRound, MonitorSmartphone, MoreVertical, Pencil, RefreshCw, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type PosTerminalRow = {
    id: string
    name: string
    keyId: string | null
    status: 'pending' | 'active' | 'revoked'
    createdAt: string | Date
}

const statusBadge: Record<PosTerminalRow['status'], { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-orange-100 text-orange-800' },
    active: { label: 'Activo', className: 'bg-green-100 text-green-800' },
    revoked: { label: 'Revocado', className: 'bg-red-100 text-red-800' },
}

export const PosTerminalsView = () => {
    const router = useRouter()
    const utils = api.useUtils()

    const [deleting, setDeleting] = useState<PosTerminalRow | null>(null)
    const [resetting, setResetting] = useState<PosTerminalRow | null>(null)

    const [terminals] = api.posTerminals.list.useSuspenseQuery()

    const { mutate: generateKey, isPending: isGeneratingKey } = api.posTerminals.generateKey.useMutation({
        onSuccess: () => {
            utils.posTerminals.list.invalidate()
            toast.success('Key generada correctamente')
        },
        onError: (error) => {
            toast.error('Error al generar la key: ' + error.message)
        }
    })

    const { mutate: resetKey, isPending: isResettingKey } = api.posTerminals.resetKey.useMutation({
        onSuccess: () => {
            utils.posTerminals.list.invalidate()
            setResetting(null)
            toast.success('Key regenerada correctamente')
        },
        onError: (error) => {
            toast.error('Error al regenerar la key: ' + error.message)
        }
    })

    const { mutate: deleteTerminal, isPending: isDeleting } = api.posTerminals.delete.useMutation({
        onSuccess: () => {
            utils.posTerminals.list.invalidate()
            setDeleting(null)
            toast.success('Caja eliminada exitosamente')
        },
        onError: (error) => {
            toast.error('Hubo un error al eliminar la caja: ' + error.message)
        }
    })

    const handleCopyKey = async (keyId: string) => {
        try {
            await navigator.clipboard.writeText(keyId)
            toast.success('Key copiada al portapapeles')
        } catch {
            toast.error('No se pudo copiar la key')
        }
    }

    return (
        <div className="px-6 sm:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                        <MonitorSmartphone className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-xl leading-tight">Cajas POS</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Gestioná las cajas registradoras de tu negocio.
                        </p>
                    </div>
                </div>

                <Button variant='primary' nativeButton={false} render={<Link href="/dashboard/pos-terminals/new" />}>
                    Nueva caja
                </Button>
            </div>

            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Key</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha de creación</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {terminals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant='icon'>
                                                <MonitorSmartphone />
                                            </EmptyMedia>
                                            <EmptyTitle>No hay cajas registradas</EmptyTitle>
                                            <EmptyDescription>
                                                Creá tu primera caja para empezar a vender desde tu punto de venta.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                        <Button variant='primary' nativeButton={false} render={<Link href="/dashboard/pos-terminals/new" />}>
                                            Nueva caja
                                        </Button>
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        ) : (
                            terminals.map((terminal) => (
                                <TableRow key={terminal.id} className="hover:bg-gray-50">
                                    <TableCell className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <MonitorSmartphone className="h-4 w-4 text-gray-500" />
                                        </div>
                                        {terminal.name}
                                    </TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={statusBadge[terminal.status].className}>
                                            {statusBadge[terminal.status].label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(terminal.createdAt).toLocaleDateString('es-PY')}</TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        {terminal.status === 'pending' && !terminal.keyId && (
                                            <Button
                                                size='sm'
                                                variant='primary'
                                                disabled={isGeneratingKey}
                                                onClick={() => generateKey({ id: terminal.id })}
                                            >
                                                <KeyRound className="h-4 w-4" />
                                                Generar Key
                                            </Button>
                                        )}
                                        {terminal.status === 'pending' && terminal.keyId && (
                                            <Button
                                                variant='outline'
                                                size='icon'
                                                title="Regenerar key"
                                                disabled={isResettingKey}
                                                onClick={() => resetKey({ id: terminal.id })}
                                            >
                                                <RefreshCw />
                                            </Button>
                                        )}
                                        {terminal.status === 'active' && (
                                            <Button
                                                variant='outline'
                                                size='icon'
                                                title="Resetear key"
                                                onClick={() => setResetting(terminal)}
                                            >
                                                <RefreshCw />
                                            </Button>
                                        )}
                                        {terminal.status === 'revoked' && (
                                            <Button
                                                variant='outline'
                                                size='icon'
                                                title="Generar nueva key"
                                                disabled={isResettingKey}
                                                onClick={() => resetKey({ id: terminal.id })}
                                            >
                                                <RefreshCw />
                                            </Button>
                                        )}
                                        <Button variant='outline' size='icon' onClick={() => router.push(`/dashboard/pos-terminals/${terminal.id}/edit`)}>
                                            <Pencil />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <MoreVertical />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.push(`/dashboard/pos-terminals/${terminal.id}/edit`)}>
                                                    <Pencil />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem variant="destructive" onClick={() => setDeleting(terminal)}>
                                                    <Trash2 />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!resetting} onOpenChange={(open) => !open && setResetting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Resetear key de la caja?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esto desconectará la terminal física vinculada a <span className="font-medium">{resetting?.name}</span> y
                            va a necesitar activarse de nuevo con una key nueva antes de poder usarse.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={isResettingKey}
                            onClick={() => resetting && resetKey({ id: resetting.id })}
                        >
                            {isResettingKey ? 'Reseteando...' : 'Resetear key'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar caja?</AlertDialogTitle>
                        <AlertDialogDescription>
                            La caja <span className="font-medium">{deleting?.name}</span> se marcará como inactiva y dejará de aparecer en tu lista de cajas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => deleting && deleteTerminal({ id: deleting.id })}
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
