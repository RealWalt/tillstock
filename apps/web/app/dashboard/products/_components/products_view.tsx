'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, MoreVertical, Package, Pencil, Search, SearchX, Trash2 } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { api } from "@/lib/trpc"
import { PAGE_SIZE } from "@/lib/constants"
import { toast } from "sonner"
import { EditProductForm } from "./product_form"

type ProductRow = {
    id: string
    name: string
    description: string | null
    sku: string | null
    barcode: string | null
    stock: number
    isActive: boolean
    salePrice: number 
    purchasePrice: number
    categoryId: string | null
    supplierId: string | null
}

const getStockBadge = (stock: number) => {
    if (stock === 0) return { label: 'Agotado', className: 'bg-red-100 text-red-800' }
    if (stock <= 5) return { label: 'Stock bajo', className: 'bg-orange-100 text-orange-800' }
    return { label: 'Disponible', className: 'bg-green-100 text-green-800' }
}

export const ProductsView = () => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const page = Number(searchParams.get('page') ?? 1)
    const search = searchParams.get('search') ?? ''
    const categoryId = searchParams.get('categoryId') ?? 'all'
    const supplierId = searchParams.get('supplierId') ?? 'all'

    const [searchInput, setSearchInput] = useState(search)
    const [editing, setEditing] = useState<ProductRow | null>(null)
    const [deleting, setDeleting] = useState<ProductRow | null>(null)

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
    }, 400)

    const utils = api.useUtils()

    const [data] = api.product.list.useSuspenseQuery({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        categoryId: categoryId !== 'all' ? categoryId : undefined,
        supplierId: supplierId !== 'all' ? supplierId : undefined,
    })

    const [categories] = api.category.list.useSuspenseQuery({ page: 1, limit: 100, type: 'product' })
    const [suppliers] = api.supplier.list.useSuspenseQuery({ page: 1, limit: 100, status: 'active' })

    const categoryOptions = categories.items.map((category) => ({ label: category.name, value: category.id }))
    const supplierOptions = suppliers.items.map((supplier) => ({ label: supplier.name, value: supplier.id }))

    const categoryName = (id: string | null) => categoryOptions.find((option) => option.value === id)?.label ?? '-'
    const supplierName = (id: string | null) => supplierOptions.find((option) => option.value === id)?.label ?? '-'

    const deleteProduct = api.product.delete.useMutation({
        onSuccess: () => {
            setDeleting(null)
            utils.product.list.invalidate()
            toast.success('Producto eliminado')
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    return (
        <div className="px-6 sm:px-8 py-8 space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                    <Package className="text-yellow-500" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 text-xl leading-tight">Productos</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Gestiona tu inventario de productos.
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-xl p-4">
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Buscar producto..."
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
                        items={[{ label: 'Todas las categorías', value: 'all' }, ...categoryOptions]}
                        value={categoryId}
                        onValueChange={(value) => updateSearchParams({ categoryId: value, page: '1' })}
                        defaultValue="all"
                    >
                        <SelectTrigger className="w-44">
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

                    <Select
                        items={[{ label: 'Todos los proveedores', value: 'all' }, ...supplierOptions]}
                        value={supplierId}
                        onValueChange={(value) => updateSearchParams({ supplierId: value, page: '1' })}
                        defaultValue="all"
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los proveedores</SelectItem>
                            {supplierOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button variant='primary' onClick={() => router.push('/dashboard/products/new')}>
                    Nuevo producto
                </Button>
            </div>

            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Proveedor</TableHead>
                            <TableHead>Precio de venta</TableHead>
                            <TableHead>Stock</TableHead>
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
                                                { search ? <SearchX /> : <Package />}
                                            </EmptyMedia>
                                            <EmptyTitle>
                                                { search ? "No se encontraron resultados" : "No hay productos aún" }
                                            </EmptyTitle>
                                            <EmptyDescription>
                                                { search
                                                ? "Intenta con otra búsqueda"
                                                : "Crea tu primer producto para gestionar tu inventario" }
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.items.map((product) => {
                                const stockBadge = getStockBadge(product.stock)
                                return (
                                    <TableRow key={product.id} className="hover:bg-gray-50">
                                        <TableCell className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                <Package className="h-4 w-4 text-gray-500" />
                                            </div>
                                            {product.name}
                                        </TableCell>
                                        <TableCell>{product.sku || "-"}</TableCell>
                                        <TableCell>{categoryName(product.categoryId)}</TableCell>
                                        <TableCell>{supplierName(product.supplierId)}</TableCell>
                                        <TableCell>{product.salePrice.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span>{product.stock}</span>
                                                <Badge className={stockBadge.className}>{stockBadge.label}</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={product.isActive ? "bg-green-100 text-green-800" : "bg-orange-100 text-red-800"}>
                                                {product.isActive ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <Button variant='outline' size='icon' onClick={() => setEditing(product)}>
                                                <Pencil />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={<Button variant='outline' size='icon' />}>
                                                    <MoreVertical />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditing(product)}>
                                                        <Pencil />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem variant="destructive" onClick={() => setDeleting(product)}>
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

            <EditProductForm
                product={editing}
                open={!!editing}
                onOpenChange={(open) => !open && setEditing(null)}
                categoryOptions={categoryOptions}
                supplierOptions={supplierOptions}
            />

            <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            El producto <span className="font-medium">{deleting?.name}</span> se marcará como inactivo y dejará de aparecer en el punto de venta.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={deleteProduct.isPending}
                            onClick={() => deleting && deleteProduct.mutate({ id: deleting.id })}
                        >
                            {deleteProduct.isPending ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
