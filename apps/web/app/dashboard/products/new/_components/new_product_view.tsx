'use client'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/trpc"
import { useUploadThing } from "@/lib/uploadthing"
import { Barcode, Car, CloudUpload, ImageIcon, Search, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { z } from "zod"
import { toast } from "sonner"
import { useDebouncedCallback } from "use-debounce"

const productSchema = z.object({
    name: z.string().min(1, { message: "El nombre del producto es obligatorio" }),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    description: z.string().optional(),
    salePrice: z.number().min(1, { message: "El precio de venta debe ser mayor a 0" }),
    purchasePrice: z.number().min(1, { message: "El precio de compra debe ser mayor a 0" }),
    stock: z.number().min(0, { message: "El stock debe ser mayor o igual a 0" }),
    supplierId: z.string().optional(),
    categoryId: z.string().optional(),
    imageUrl: z.string().optional(),
})


export const NewProductView = () => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const page = Number(searchParams.get("page") ?? 1)
    const search = searchParams.get("search") ?? ""

    const [searchInput, setSearchInput] = useState(search)

    const [name, setName] = useState('')
    const [sku, setSku] = useState('')
    const [barcode, setBarcode] = useState('')
    const [description, setDescription] = useState('')
    const [salePrice, setSalePrice] = useState('')
    const [purchasePrice, setPurchasePrice] = useState('')
    const [stock, setStock] = useState('')
    const [supplierId, setSupplierId] = useState<string | null>(null)

    const [categoryId, setCategoryId] = useState<string | null>(null)

    const [imageUrl, setImageUrl] = useState<string | undefined>()
    const [previewUrl, setPreviewUrl] = useState<string | undefined>()

    const [suppliers] = api.supplier.list.useSuspenseQuery({ status: 'active', page: 1, search: undefined, limit: 100})

    const supplierOptions = suppliers.items.map((supplier) => ({
        label: supplier.name,
        value: supplier.id
    }))

    const { startUpload, isUploading } = useUploadThing('productImage', {
        onClientUploadComplete: (res) => {
            setImageUrl(res[0]?.ufsUrl)
            toast.success('Imagen subida correctamente')
        },
        onUploadError: (error) => {
            toast.error('Error al subir la imagen: ' + error.message)
        }
    })

    const handleFileSelect = (e:  React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if(!file) return 

        setPreviewUrl(URL.createObjectURL(file))
        startUpload([file])
    }
    
    const handleRemoveImage = () => {
        setImageUrl(undefined)
        setPreviewUrl(undefined)
    }  
    
    const updateSearchParams = (updates: Record<string, string | null>) => {
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
        updateSearchParams({ search: value, page: '1' })
    }, 400)

    const [categories] = api.category.list.useSuspenseQuery({
        page,
        limit: 100,
        search: search || undefined,
        type: 'product'
    })

    const categoryOptions = categories.items.map((category) => ({
        label: category.name,
        value: category.id
    }))

    const { mutate, isPending} = api.product.create.useMutation({
        onSuccess: () => {
            setName('')
            setSku('')
            setBarcode('')
            setDescription('')
            setSalePrice('')
            setPurchasePrice('')
            setStock('')
            toast.success('Producto creado correctamente')
            router.push('/dashboard/products')
        },
        onError: (error) => {
            toast.error('Error al crear el producto: ' + error.message)
        }
    })

    const handleCreateProduct = () => {
        const result = productSchema.safeParse({
            name,
            sku,
            barcode,
            description,
            salePrice: salePrice ?? 0,
            purchasePrice: purchasePrice ?? 0,
            stock: stock ?? 0,
            supplierId: supplierId ?? undefined,
            categoryId: categoryId ?? undefined,
            imageUrl: imageUrl ?? undefined
        })

        if(!result.success) {
            const errorMessage = result.error.issues[0]?.message;
            toast.error('Error al crear el producto: ' + errorMessage)
            return
        }

        mutate(result.data)
    }

    return (
        <div className="px-6 sm:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-gray-900 font-semibold text-xl leading-tight">
                        Crear nuevo producto
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Completa la información para agregar un nuevo producto a tu inventario
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant='primary' onClick={handleCreateProduct} disabled={isPending || isUploading}>
                        <CloudUpload className="h-4 w-4" />
                        Crear Producto
                    </Button>
                </div>
            </div>

            
                {/*Columna 1 */}
            <div className="flex items-start w-xl gap-x-10 justify-between">
                <div className="flex-1 space-y-6">
                    <h3 className="font-bold">Información básica</h3>

                    <div className="space-y-3 ">
                        <Label>Nombre del Producto <span className="text-red-600 font-bold">*</span></Label>
                        <Input
                            placeholder="Ej: Coca-Cola 2.5L"
                            className="w-xl rounded-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="space-y-3"> 
                            <Label>SKU (Codigo del producto) </Label>
                            <Input
                                placeholder="Ej: PROD-23882"
                                className="rounded-sm"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Codigo unico para identificar al producto (Opcional)</p>

                        </div>

                        <div className="space-y-3"> 
                            <Label>Codigo de Barras </Label>
                            <div className="relative">
                                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                                <Input
                                    placeholder="Escanea o ingresa codigo de barras"
                                    className="rounded-sm pl-9"
                                    value={ barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    />
                            </div>
                            <p className="text-xs text-muted-foreground">Dejar vacio para generar automáticamente</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Descripción</Label>
                        <Textarea
                            placeholder="Descripción general de tu producto... (Opcional)"
                            className="w-md"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Proveedores </Label>
                        <Select
                            items={supplierOptions}
                            value={supplierId}
                            onValueChange={setSupplierId}
                        >
                            <SelectTrigger className="w-md">
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

                        <Link className="text-sm text-blue-700 font-bold" href='/dashboard/suppliers'>
                            + Nuevo proveedor
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="space-y-3">
                            <Label>Precio de compra</Label>
                            <Input 
                                type="number"
                                placeholder="Ej: 69800"
                                min={1}
                                value={purchasePrice}
                                onChange={(e) => setPurchasePrice(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Precio de venta</Label>
                            <Input 
                                type="number"
                                placeholder="Ej: 75000"
                                min={1}
                                value={salePrice}
                                onChange={(e) => setSalePrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Stock - Unidades</Label>
                        <Input 
                            type="number"
                            placeholder="Ej: 100"
                            min={1}
                            className="w-32"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-80 shrink-0 space-y-5">
                    <div className="border border-gray-200 rounded-xl p-5 space-y-3">
                        <h3 className="font-semibold text-sm text-gray-900">Imagen del producto</h3>
                         <Label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                                disabled={isUploading}
                            />
                            {previewUrl ? (
                                <>
                                <Image src={previewUrl} alt="Preview" className="max-h-32 mx-auto rounded-md" width={128} height={128} />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                    e.preventDefault() // evita que dispare el input file al hacer click
                                    handleRemoveImage()
                                    }}
                                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm border border-gray-200 hover:bg-gray-50"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                </>
                            ) : (
                                <>
                                <ImageIcon className="w-8 h-8 text-gray-300 mx-auto" />
                                <p className="text-sm text-gray-500 mt-2">
                                    {isUploading ? 'Subiendo...' : 'Hacé clic para seleccionar una imagen'}
                                </p>
                                </>
                            )}
                        </Label>
                    </div>

                    <div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-gray-900">Categorías</Label>
                            <p className="text-xs text-muted-foreground">Selecciona la categoría del producto</p>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/4 text-muted-foreground w-4 h-4" />
                                <Input
                                    className="rounded-sm pl-9"
                                    value={searchInput}
                                    placeholder="Buscar categoría"
                                    onChange={(e) => {
                                        setSearchInput(e.target.value)
                                        debouncedSearch(e.target.value)
                                    }}
                                    />
                            </div>

                            <div className="space-y-2 overflow-scroll ">
                                {categoryOptions.map((option) => (
                                    <button 
                                        key={option.value}
                                        type='button'
                                        onClick={() => setCategoryId(option.value)}
                                        className="flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-gray-50"
                                        >
                                            <Checkbox className="border-gray-300" checked={categoryId === option.value} />
                                            <span>{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}