'use client'

import { AlertDialog } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/trpc"
import { useUploadThing } from "@/lib/uploadthing"
import { Clock, CloudUpload, ImageIcon, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

const serviceSchema = z.object({
    name: z.string().min(1, 'El nombre del servicio es obligatorio'),
    description: z.string().optional(),
    duration: z.number().min(1, 'La duración debe ser de al menos 1 minuto'),
    price: z.number().min(1, 'Pon un monto válido'),
    categoryId: z.string().optional(),
    imageUrl: z.string().optional(),
    isActive: z.boolean().default(true)
})

export type ServiceFormData = {
    id: string
    name: string
    description: string | null
    duration: number
    categoryId: string | null
    price: number
    isActive: boolean
    imageUrl: string | null
}

type ServiceFromViewProps = {
    mode: 'create' | 'edit',
    service?: ServiceFormData
}



export const ServiceFormView = ({ mode, service}: ServiceFromViewProps) => {
    const router = useRouter()

    const [categories] = api.category.list.useSuspenseQuery({ limit: 100, page: 1, search: undefined, type: 'service' })
    const categoriesOptions = categories.items.map((category) => ({
        label: category.name,
        value: category.id
    }))
    const [name, setName] = useState(service?.name ?? '')
    const [description, setDescription] = useState(service?.description ?? '')
    const [duration, setDuration] = useState(service?.duration ?? '')
    const [price, setPrice] = useState(service?.price ?? '')
    const [isActive, setIsActive] = useState(service?.isActive ?? true)
    
    const [categoryId, setCategoryId] = useState<string | null>(service?.categoryId ?? null)

    const [imageUrl, setImageUrl] = useState<string | undefined>(service?.imageUrl ?? undefined)
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(service?.imageUrl ?? undefined)

    const { startUpload, isUploading } = useUploadThing('serviceImage', {
        onClientUploadComplete: (res) => {
            setImageUrl(res[0]?.ufsUrl)
            toast.success('Imagen subida correctamente')
        },
        onUploadError: (error) => {
            toast.error('Error al subir la imagen: ' + error.message)
        }
    })

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setPreviewUrl(URL.createObjectURL(file))
        startUpload([file])
    }

    const handleRemoveImage = () => {
        setImageUrl(undefined)
        setPreviewUrl(undefined)
    }

    const utils = api.useUtils()

    const { mutate: createService, isPending: isCreating } = api.services.create.useMutation({
        onSuccess: () => {
            setName('')
            setDescription('')
            setDuration('')
            setPrice('')
            setCategoryId(null)
            setImageUrl(undefined)
            setPreviewUrl(undefined)
            utils.services.list.invalidate()
            toast.success('Servicio creado correctamente')
        },
        onError: (error) => {
            toast.error('Error al crear el servicio: ' + error.message)
        }
    })

    const { mutate: updateService, isPending: isUpdating} = api.services.update.useMutation({
        onSuccess: () => {
            utils.services.list.invalidate()
            utils.product.getById.invalidate({ id: service?.id})
            toast.success('Service actualizado correctamente')
            router.push('/dashboard/services')
        },
        onError: (error) => {
            toast.error('Error al actualizar el producto: ' + error.message)
        }
    })

    const isPending = mode === 'create' ? isCreating : isUpdating

    const handleSubmit = () => {
        const result = serviceSchema.safeParse({
            name,
            description,
            duration: Number(duration) || 0,
            price: Number(price) || 0,
            imageUrl: imageUrl ?? undefined,
            categoryId: categoryId ?? undefined,
            isActive
        })

        if (!result.success) {
            const errorMessage = result.error.issues[0]?.message
            toast.error(`Error al ${mode === 'create' ? 'crear' : 'actualizar'} el producto: ` + errorMessage)
            return
        }

        if(mode === 'create') {
            createService(result.data)
        } else if (service) {
            updateService({ id: service.id, ...result.data})
        }

    }

    return (
        <div className="px-6 sm:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-gray-900 font-semibold text-xl leading-tight">
                        { mode === 'create' ? 'Crear nuevo servicio' : 'Edit servicio'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        { mode === 'create'
                            ? 'Completa la información para agregar un nuevo servicio'
                            : 'Actualizá la información de tu producto'
                        }
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant='primary' disabled={isPending || isUploading} onClick={handleSubmit}>
                        <CloudUpload className="h-4 w-4" />
                        {mode === 'create' ? 'Crear Servicio' : 'Guardar cambios'}
                    </Button>
                </div>
            </div>

            {/*Columna 1 */}
            <div className="flex items-start w-xl gap-x-10 justify-between">
                <div className="flex-1 space-y-6">
                    <h3 className="font-bold">Información básica</h3>

                    <div className="flex  gap-2">
                        <div className="space-y-3">
                            <Label>Nombre del Servicio <span className="text-red-600 font-bold">*</span></Label>
                            <Input
                                placeholder="Ej: Corte de cabello, Limpieza facial, etc."
                                className="w-sm rounded-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Categoría <span className="text-red-600 font-bold">*</span></Label>
                            <Select
                                items={categoriesOptions}
                                value={categoryId}
                                onValueChange={(value) => setCategoryId(value ?? null)}
                            >
                                <SelectTrigger className='w-44'>
                                    <SelectValue placeholder='Categoría' />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoriesOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Link className="text-sm text-blue-600 font-semibold inline-block" href='/dashboard/categories'>
                        + Nueva categoría
                    </Link>

                    <div className="space-y-3">
                        <Label>Descripción</Label>
                        <Textarea
                            placeholder="Describe el servicio, beneficios, detalles importantes, etc."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Duración estimada <span className="text-red-600 font-bold">*</span></Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="number"
                                placeholder="Ej: 40, 60, 90"
                                className="pl-9"
                                min={1}
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                            <span className="absolute text-sm text-muted-foreground right-8 top-1/2 -translate-y-1/2">mins</span>
                        </div>
                    </div>

                    <div className="flex gap-5 ">
                        <div className="space-y-3">
                            <Label>Costo del servicio <span className="text-red-600 font-bold">*</span></Label>
                            <Input
                                type="number"
                                placeholder="Ej: 30000"
                                className="w-44"
                                value={price}
                                min={1}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>

                        { mode === 'edit' && (
                            <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                                <div>
                                    <Label className="text-sm font-medium">Servicio activo</Label>
                                    <p className="text-xs text-muted-foreground">
                                    Los servicios inactivos no aparecen en el POS ni en las ventas
                                    </p>
                                </div>
                                <Switch checked={isActive} onCheckedChange={setIsActive} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-80 shrink-0 space-y-5">
                    <div>
                        <h3 className="text-gray-900 font-semibold">Imagen del servicio</h3>
                        <Label className="block mt-5 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors relative">
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
                                            e.preventDefault()
                                            handleRemoveImage()
                                        }}
                                        disabled={isUploading}
                                        className="absolute top-2 cursor-pointer right-2 bg-white rounded-full p-1 shadow-sm border border-gray-200 hover:bg-gray-50"
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
                </div>
            </div>
        </div>
    )
}