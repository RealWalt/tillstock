'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PAGE_SIZE } from "@/lib/constants"
import { api } from "@/lib/trpc"
import { ChevronLeft, ChevronRight, MoreVertical, Pencil, Search, SearchX, Trash2, Users } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useDebouncedCallback } from "use-debounce"

type EmployeeRow = {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    roleName: string
    isActive: boolean
    imageUrl: string | null
}

export const EmpleadosView = () => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const page = Number(searchParams.get('page') ?? 1)
    const search = searchParams.get('search') ?? ''

    const [searchInput, setSearchInput] = useState(search)
    const [deleting, setDeleting] = useState<EmployeeRow | null>(null)

    const updateSearchParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) {
                params.delete(key)
            } else {
                params.set(key, value)
            }
        })
        router.push(`${pathname}?${params.toString()}`)
    }

    const debouncedSearch = useDebouncedCallback((value: string) => {
        updateSearchParams({ search: value, page: '1' })
    }, 250)

    const utils = api.useUtils()
    const [data] = api.businessMembers.list.useSuspenseQuery({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
    })

    const { mutate: removeMember, isPending: isRemoving } = api.businessMembers.remove.useMutation({
        onSuccess: () => {
            utils.businessMembers.list.invalidate()
            setDeleting(null)
            toast.success('Empleado inhabilitado exitosamente')
        },
        onError: (error) => {
            toast.error('Hubo un error al eliminar el empleado: ' + error.message)
        }
    })

    return (
        <div className="px-6 sm:px-8 py-8 space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 text-xl leading-tight">Empleados</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Gestioná el equipo que trabaja en tu negocio.
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-xl p-4">
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar empleado..."
                        className="pl-9"
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value)
                            debouncedSearch(e.target.value)
                        }}
                    />
                </div>

                <Button variant='primary' onClick={() => router.push(`/dashboard/employees/new`)}>
                    Nuevo empleado
                </Button>
            </div>

            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Foto</TableHead>
                            <TableHead>Nombre completo</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha de ingreso</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant='icon'>
                                                {search ? <SearchX /> : <Users />}
                                            </EmptyMedia>
                                            <EmptyTitle>
                                                {search ? "No se encontraron resultados" : "No hay empleados aún"}
                                            </EmptyTitle>
                                            <EmptyDescription>
                                                {search
                                                    ? "Intenta con otra búsqueda"
                                                    : "Agregá tu primer empleado para empezar a gestionar tu equipo"}
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.items.map((member) => {
                                const fullName = member.firstName && member.lastName
                                    ? `${member.firstName} ${member.lastName}`
                                    : null
                                const initials = member.firstName && member.lastName
                                    ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
                                    : member.email.charAt(0).toUpperCase()

                                return (
                                <TableRow key={member.id} className="hover:bg-gray-50">
                                    <TableCell>
                                        <Avatar>
                                            {member.imageUrl && <AvatarImage src={member.imageUrl} alt={fullName ?? member.email} />}
                                            <AvatarFallback>
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/employees/${member.id}`} className="hover:underline">
                                            {fullName ?? <span className="text-muted-foreground italic">Invitación pendiente</span>}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>
                                        <Badge className="bg-blue-100 text-blue-800">{member.roleName}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={member.isActive ? "bg-green-100 text-green-800" : "bg-orange-100 text-red-800"}>
                                            {member.isActive ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(member.createdAt).toLocaleDateString('es-PY')}</TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <Button variant='outline' size='icon' onClick={() => { router.push(`/dashboard/employees/${member.id}/edit`) }}>
                                            <Pencil />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <MoreVertical />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => { router.push(`/dashboard/employees/${member.id}/edit`) }}>
                                                    <Pencil />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem variant="destructive" onClick={() => { setDeleting(member) }}>
                                                    <Trash2 />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                    Mostrando {data.items.length} de {data.total} empleados
                </p>

                <div className="flex items-center gap-2">
                    <Button
                        variant='default'
                        size='icon'
                        disabled={page === 1}
                        onClick={() => updateSearchParams({ page: (page - 1).toString() })}
                    >
                        <ChevronLeft />
                    </Button>
                    {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                        <Button
                            key={p}
                            variant={p === page ? "primary" : "outline"}
                            size='icon'
                            onClick={() => updateSearchParams({ page: p.toString() })}
                        >
                            {p}
                        </Button>
                    ))}
                    <Button
                        variant='default'
                        size='icon'
                        disabled={page === data.totalPages}
                        onClick={() => updateSearchParams({ page: (page + 1).toString() })}
                    >
                        <ChevronRight />
                    </Button>
                </div>
            </div>

            <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar empleado?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <span className="font-medium">{deleting?.firstName} {deleting?.lastName}</span> se marcará como inactivo y perderá acceso al sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={isRemoving}
                            onClick={() => deleting && removeMember({ memberId: deleting.id })}
                        >
                            {isRemoving ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
