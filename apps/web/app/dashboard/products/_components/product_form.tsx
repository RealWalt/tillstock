'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/trpc"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

const productSchema = z.object({
    name: z.string().min(1, { message: "El nombre del producto es obligatorio" }),
    description: z.string().optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    salePrice: z.number().min(1, { message: "El precio de venta debe ser mayor a 0" }),
    purchasePrice: z.number().min(1, { message: "El precio de compra debe ser mayor a 0" }),
    stock: z.number().min(0, { message: "El stock debe ser mayor o igual a 0" }),
    categoryId: z.string().optional(),
    supplierId: z.string().optional(),
})

type Option = { label: string; value: string }

type EditableProduct = {
    id: string
    name: string
    description: string | null
    sku: string | null
    barcode: string | null
    stock: number
    salePrice: number
    purchasePrice: number
    categoryId: string | null
    supplierId: string | null
}

type EditProductFormProps = {
    product: EditableProduct | null
    open: boolean
    onOpenChange: (open: boolean) => void
    categoryOptions: Option[]
    supplierOptions: Option[]
}

export const EditProductForm = ({ product, open, onOpenChange, categoryOptions, supplierOptions }: EditProductFormProps) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [sku, setSku] = useState('')
    const [barcode, setBarcode] = useState('')
    const [salePrice, setSalePrice] = useState('')
    const [purchasePrice, setPurchasePrice] = useState('')
    const [stock, setStock] = useState('')
    const [categoryId, setCategoryId] = useState<string | null>(null)
    const [supplierId, setSupplierId] = useState<string | null>(null)

    const utils = api.useUtils()

    useEffect(() => {
        if (product) {
            setName(product.name)
            setDescription(product.description ?? '')
            setSku(product.sku ?? '')
            setBarcode(product.barcode ?? '')
            setSalePrice(String(product.salePrice))
            setPurchasePrice(String(product.purchasePrice))
            setStock(String(product.stock))
            setCategoryId(product.categoryId)
            setSupplierId(product.supplierId)
        }
    }, [product])

    const { mutate, isPending } = api.product.update.useMutation({
        onSuccess: () => {
            onOpenChange(false)
            utils.product.list.invalidate()
            toast.success('Producto actualizado correctamente')
        },
        onError: (error) => {
            toast.error('Error al actualizar el producto: ' + error.message)
        }
    })

    const handleUpdate = () => {
        if (!product) return
        const result = productSchema.safeParse({
            name,
            description,
            sku,
            barcode,
            salePrice: Number(salePrice),
            purchasePrice: Number(purchasePrice),
            stock: Number(stock),
            categoryId: categoryId ?? undefined,
            supplierId: supplierId ?? undefined,
        })

        if (!result.success) {
            const errorMessage = result.error.issues[0]?.message
            toast.error('Error al actualizar el producto: ' + errorMessage)
            return
        }

        mutate({ id: product.id, ...result.data })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="font-semibold">
                        Editar producto
                    </DialogTitle>
                    <DialogDescription>
                        Actualizá la información de tu producto.
                    </DialogDescription>
                    <Separator />
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-medium leading-none">
                            Nombre del Producto
                        </Label>
                        <Input
                            id="name"
                            placeholder="Ej: Coca-Cola 2.5L"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="space-y-3 flex-1">
                            <Label htmlFor="sku" className="text-sm font-medium leading-none">
                                SKU
                            </Label>
                            <Input
                                id="sku"
                                placeholder="Ej: PROD-23882"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3 flex-1">
                            <Label htmlFor="barcode" className="text-sm font-medium leading-none">
                                Código de barras
                            </Label>
                            <Input
                                id="barcode"
                                placeholder="Escanea o ingresa código de barras"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="description" className="text-sm font-medium leading-none">
                            Descripción (Opcional)
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Descripción general de tu producto..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="space-y-3 flex-1">
                            <Label htmlFor="purchasePrice" className="text-sm font-medium leading-none">
                                Precio de compra
                            </Label>
                            <Input
                                id="purchasePrice"
                                type="number"
                                min={1}
                                placeholder="Ej: 69800"
                                value={purchasePrice}
                                onChange={(e) => setPurchasePrice(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3 flex-1">
                            <Label htmlFor="salePrice" className="text-sm font-medium leading-none">
                                Precio de venta
                            </Label>
                            <Input
                                id="salePrice"
                                type="number"
                                min={1}
                                placeholder="Ej: 75000"
                                value={salePrice}
                                onChange={(e) => setSalePrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="stock" className="text-sm font-medium leading-none">
                            Stock - Unidades
                        </Label>
                        <Input
                            id="stock"
                            type="number"
                            min={0}
                            placeholder="Ej: 100"
                            className="w-32"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="category" className="text-sm font-medium leading-none">
                            Categoría
                        </Label>
                        <Select items={categoryOptions} value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccioná una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {categoryOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="supplier" className="text-sm font-medium leading-none">
                            Proveedor
                        </Label>
                        <Select items={supplierOptions} value={supplierId} onValueChange={setSupplierId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccioná un proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                                {supplierOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="primary" disabled={isPending} className="w-full" onClick={handleUpdate}>
                        {isPending ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
