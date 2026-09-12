'use client';

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, MoreVertical, Pencil, Search, SearchX, Trash2, Truck } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EditSupplierForm, SupplierForm } from "./supplier_form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebouncedCallback } from "use-debounce";
import { api } from "@/lib/trpc";
import { PAGE_SIZE } from "../../../../lib/constants";
import { useState } from "react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const statusFilter = [
    { label: "Todos", value: 'all'},
    { label: "Activos", value: 'active'},
    { label: "Inactivo", value: 'inactive'}
] as const;

type SupplierRow = {
    id: string
    name: string
    contactName: string | null
    description: string | null
    phone: string | null
    email: string | null
    ruc: string | null
    isActive: boolean
}

export const SuppliersView = () => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();


    const page = Number(searchParams.get('page') ?? 1)
    const search = searchParams.get('search') ?? ''
    const status = searchParams.get('status') ?? 'all'

    const updateSearchParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if(value === null) {
                params.delete(key)
            } else {
                params.set(key, value)
            }
        })

        router.push(`${pathname}?${params.toString()}`)
    }

    const [searchInput, setSearchInput] = useState(search)
    const [editing, setEditing] = useState<SupplierRow | null>(null)
    const [deleting, setDeleting] = useState<SupplierRow | null>(null)

    const debouncedSearch = useDebouncedCallback((value: string) => {
        updateSearchParams({ search: value, page: "1", status: "all" });
    }, 400);

    const utils = api.useUtils();

    const [data] = api.supplier.list.useSuspenseQuery({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: status !== 'all' ? (status as 'active' | 'inactive') : undefined,
    })

    const deleteSupplier = api.supplier.delete.useMutation({
        onSuccess: () => {
            setDeleting(null)
            utils.supplier.list.invalidate();
            toast.success('Proveedor eliminado')
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    return (
        <div className="px-6 sm:px-8 py-8 space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                    <h3 className="text-gray-900 font-semibold text-xl leading-tight">
                        Proveedores
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Gestioná tus proveedores y el origen de tus productos.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Buscar proveedores..."
                        className="pl-9" value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value)
                            debouncedSearch(e.target.value)
                        }} />
                </div>
                <Select items={statusFilter} value={status} onValueChange={(value) => updateSearchParams({ status: value, page: "1" })} defaultValue="all">
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Estado " />
                    </SelectTrigger>
                    <SelectContent>
                        {statusFilter.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                            {status.label}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <SupplierForm />
            </div>

            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Proveedor</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>RUC</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Ordenes de Compra</TableHead>
                            <TableHead>Total comprado</TableHead>
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
                                        { search ? <SearchX /> : <Truck />}
                                    </EmptyMedia>
                                    <EmptyTitle>
                                        { search ? "No se encontraron resultados" : "No hay proveedores aún" }
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        { search
                                        ? "Intenta con otra búsqueda"
                                        : "Agrega tu primer proveedor para organizar tus productos" }
                                    </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.items.map((supplier) => (
                                <TableRow key={supplier.id} className="hover:bg-gray-50">
                                    <TableCell>{supplier.name}</TableCell>
                                    <TableCell className="flex flex-col gap-1">
                                        {supplier.contactName}
                                        <span className="text-muted-foreground">{supplier.email}</span>
                                    </TableCell>
                                    <TableCell>{supplier.ruc}</TableCell>
                                    <TableCell>{supplier.phone}</TableCell>
                                    <TableCell>
                                        <Badge className={supplier.isActive ? "bg-green-100 text-green-800" : "bg-orange-100 text-red-800"}>
                                            {supplier.isActive ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell> - </TableCell>
                                    <TableCell> - </TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <Button variant='outline' size='icon' onClick={() => setEditing(supplier)}>
                                            <Pencil />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger render={<Button variant='outline' size='icon' />}>
                                                <MoreVertical />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditing(supplier)}>
                                                    <Pencil />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem variant="destructive" onClick={() => setDeleting(supplier)}>
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                Mostrando {data.items.length} de {data.total} proveedores
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
                        <ChevronRight  />
                    </Button>
                </div>
            </div>

            <EditSupplierForm
                supplier={editing}
                open={!!editing}
                onOpenChange={(open) => !open && setEditing(null)}
            />

            <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
                        <AlertDialogDescription>
                            El proveedor <span className="font-medium">{deleting?.name}</span> se marcará como inactivo. Los productos asociados no se eliminarán.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={deleteSupplier.isPending}
                            onClick={() => deleting && deleteSupplier.mutate({ id: deleting.id })}
                        >
                            {deleteSupplier.isPending ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
