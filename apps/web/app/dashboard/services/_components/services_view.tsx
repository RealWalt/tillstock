'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PAGE_SIZE } from "@/lib/constants"
import { api } from "@/lib/trpc"
import { ChevronLeft, ChevronRight, MoreVertical, Pencil, Search, SearchX, Trash2, Wrench } from "lucide-react"
import {  usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useDebouncedCallback } from "use-debounce"

type ServiceRow = {
    id: string
    name: string
    description: string | null
    duration: number
    categoryId: string | null
    price: number
    imageUrl: string | null
}


export const ServicesView = () => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const page = Number(searchParams.get('page') ?? 1)
    const search = searchParams.get('search') ?? ''
    const categoryId = searchParams.get('categoryId') ?? 'all'

    const [searchInput, setSearchInput] = useState(search)
    const [deleting, setDeleting] = useState<ServiceRow | null>(null)
    const updateSearchParams = (updates: Record <string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([key, value]) => {
            if(value === null) {
                params.delete(key)
            } else {
                params.set(key, value)
            }
        })
        router.push(`${pathname}?${params.toString()}`)
    }

    const debouncedSearch = useDebouncedCallback((value: string) => {
        updateSearchParams({ search: value, page: '1'})
    }, 250)

    const utils = api.useUtils()
    const [data] = api.services.list.useSuspenseQuery({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        categoryId: categoryId !== 'all' ? categoryId : undefined
    })

    const {mutate: deleteService, isPending: isDeleting} = api.services.delete.useMutation({
        onSuccess: () => {
            utils.services.list.invalidate()
            setDeleting(null)
            toast.success('Servicio inhabilitado exitosamente')
        },
        onError: (error) => {
            toast.error('Hubo un error al eliminar el servicio: ' + error.message)
        }
    })

    
    const [categories] = api.category.list.useSuspenseQuery({ page: 1, limit: 100, type: 'service' })
    const categoryOptions = categories.items.map((category) => ({
        label: category.name, 
        value: category.id,
        color: category.color
    }))

    const getCategory = (categoryId: string | null) => {
        if (!categoryId) return null
        return categoryOptions.find(c => c.value === categoryId) ?? null
    }

    return (
        <div className="px-6 sm:px-8 py-8 space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                    <Wrench  className="text-yellow-500"/>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 text-xl leading-tight">Servicios</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Gestiona los servicios que ofreces.
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white border border-gray-50 shadow-sm rounded-xl p-4 ">
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input 
                        placeholder="Buscar servicio..."
                        className="pl-9"
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value)
                            debouncedSearch(e.target.value)
                        }}
                    />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Select 
                        items={[{ label: 'Todas las categorías', value: 'all'}, ...categoryOptions]}
                        value={categoryId}
                        onValueChange={(value) => updateSearchParams({ categoryId: value, page: '1'}) }
                    >
                        <SelectTrigger className='w-44'>
                            <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las categorías</SelectItem>
                            {categoryOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <Button variant='primary' onClick={() => router.push(`/dashboard/services/new`)}>
                    Nuevo servicio
                </Button>
            </div>

            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Servicio</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Duración</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-64">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant='icon'>
                                                { search ? <SearchX /> : <Wrench />}
                                            </EmptyMedia>
                                            <EmptyTitle>
                                                { search ? "No se encontraron resultados" : "No hay servicios aún" }
                                            </EmptyTitle>
                                            <EmptyDescription>
                                                { search
                                                ? "Intenta con otra búsqueda"
                                                : "Crea tu primer servicio para empezar a gestionar tu negocio" }
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.items.map((service) => {
                                const category = getCategory(service.categoryId)

                                return (
                                    <TableRow key={service.id} className="hover:bg-gray-50">
                                        <TableCell className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                <Wrench className="h-4 w-4 text-gray-500" />
                                            </div>
                                            {service.name}
                                        </TableCell>
                                        <TableCell>
                                            {category?.label ?? '-'}
                                        </TableCell>
                                        <TableCell>{service.price.toLocaleString()}</TableCell>
                                        <TableCell>{service.duration} minutos</TableCell>
                                        <TableCell>
                                            <Badge className={service.isActive ? "bg-green-100 text-green-800" : "bg-orange-100 text-red-800"}>
                                                {service.isActive ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <Button variant='outline' size='icon' onClick={() => {router.push(`/dashboard/services/${service.id}/edit`)}}>
                                                <Pencil />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={<Button variant='outline' size='icon' />}>
                                                    <MoreVertical />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {router.push(`/dashboard/services/${service.id}/edit`)}}>
                                                        <Pencil />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem variant="destructive" onClick={() => {setDeleting(service)}}>
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
                    Mostrando {data.items.length} de {data.total} productos
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
                        <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
                        <AlertDialogDescription>
                            El servicio <span className="font-medium">{deleting?.name}</span> se marcará como inactivo y dejará de aparecer en el punto de venta.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={() => deleting && deleteService({ id: deleting.id })}
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}