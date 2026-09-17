'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { api } from "@/lib/trpc"
import { Mail, MoreVertical, Pencil, Send, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type EmployeeProfileViewProps = {
    employeeId: string
}

export const EmployeeProfileView = ({ employeeId }: EmployeeProfileViewProps) => {
    const router = useRouter()
    const utils = api.useUtils()

    const [member] = api.businessMembers.getById.useSuspenseQuery({ id: employeeId })

    const [inviteOpen, setInviteOpen] = useState(false)
    const [removing, setRemoving] = useState(false)

    const fullName = member.firstName && member.lastName
        ? `${member.firstName} ${member.lastName}`
        : null

    const initials = member.firstName && member.lastName
        ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
        : member.email.charAt(0).toUpperCase()

    const { mutate: sendInvitation, isPending: isSending } = api.businessInvitations.send.useMutation({
        onSuccess: () => {
            toast.success('Invitación enviada correctamente')
            setInviteOpen(false)
        },
        onError: (error) => {
            toast.error('Error al enviar la invitación: ' + error.message)
        }
    })

    const { mutate: removeMember, isPending: isRemoving } = api.businessMembers.remove.useMutation({
        onSuccess: () => {
            utils.businessMembers.list.invalidate()
            toast.success('Empleado desvinculado exitosamente')
            router.push('/dashboard/employees')
        },
        onError: (error) => {
            toast.error('Hubo un error al desvincular al empleado: ' + error.message)
        }
    })

    return (
        <div className="px-6 sm:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        {member.imageUrl && <AvatarImage src={member.imageUrl} alt={fullName ?? member.email} />}
                        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                    </Avatar>

                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                                {fullName ?? 'Invitación pendiente'}
                            </h3>
                            <Badge className={member.isActive ? "bg-green-100 text-green-800" : "bg-orange-100 text-red-800"}>
                                {member.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {member.roleName} · {member.businessName}
                        </p>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                            <Mail className="h-3.5 w-3.5" />
                            {member.email}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Desde: {new Date(member.createdAt).toLocaleDateString('es-PY')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {!member.userId && (
                        <Button variant='primary' onClick={() => setInviteOpen(true)}>
                            <Send className="h-4 w-4" />
                            Enviar invitación
                        </Button>
                    )}
                    <Button variant='outline' nativeButton={false} render={<Link href={`/dashboard/employees/${member.id}/edit`} />}>
                        <Pencil className="h-4 w-4" />
                        Editar
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MoreVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem variant="destructive" onClick={() => setRemoving(true)}>
                                <Trash2 />
                                Desvincular
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Información del empleado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">ID</span>
                        <span className="text-sm font-medium text-gray-900">{member.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rol</span>
                        <span className="text-sm font-medium text-gray-900">{member.roleName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Estado</span>
                        <Badge className={member.isActive ? "bg-green-100 text-green-800" : "bg-orange-100 text-red-800"}>
                            {member.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enviar invitación a empleado</DialogTitle>
                        <DialogDescription>
                            El empleado recibirá un correo con un enlace para crear su cuenta y acceder al sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setInviteOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant='primary'
                            disabled={isSending}
                            onClick={() => sendInvitation({ businessMemberId: member.id })}
                        >
                            {isSending ? 'Enviando...' : 'Enviar invitación'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={removing} onOpenChange={setRemoving}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Desvincular empleado?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <span className="font-medium">{fullName ?? member.email}</span> se marcará como inactivo y perderá acceso al sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={isRemoving}
                            onClick={() => removeMember({ memberId: member.id })}
                        >
                            {isRemoving ? 'Desvinculando...' : 'Desvincular'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
