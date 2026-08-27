'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search } from "lucide-react"
import { useRouter } from "next/navigation"

const statusFilter = [
    { label: 'Todos', value: 'all' },
    { label: 'Activos', value: 'active' },
    { label: 'Inactivos', value: 'inactive' },
] as const;

const stockFilter = [
    { label: 'Todos', value: 'all' },
    { label: 'Disponibles', value: 'in_stock' },
    { label: 'Stock bajo', value: 'low_stock' },
    { label: 'Agotados', value: 'out_of_stock' },
] as const  
export const ProductsView = () => {
    const router = useRouter()

    return (
        <div className= "px-6 sm:px-8 py-8 space-y-6">
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
                    />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Select items={statusFilter} value='Estado' defaultValue="all">
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusFilter.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                            {status.label}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>

                    <Select items={stockFilter} value='Stock' defaultValue="all">
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Stock" />
                    </SelectTrigger>
                    <SelectContent>
                        {stockFilter.map((stock) => (
                        <SelectItem key={stock.value} value={stock.value}>
                            {stock.label}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>

                <Button variant='primary' onClick={() => router.push('/dashboard/products/new')}>
                    Nuevo Producto
                </Button>
            </div>
        </div>
    )
}