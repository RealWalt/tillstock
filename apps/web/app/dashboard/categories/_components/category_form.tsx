'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { z } from "zod"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/trpc"
import { Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const typeOptions = [
  { label: 'Producto', value: 'product' },
  { label: 'Servicio', value: 'service' },
]

const categorySchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }),
  description: z.string().optional(),
  type: z.enum(['product', 'service']),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, { message: "El color debe ser un código hexadecimal válido" }),
})

export const CreateCategoryForm = () => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<'product' | 'service'>('product')
    const [color, setColor] = useState('#F5C518')

    const [open, setOpen] = useState(false)

    const utils = api.useUtils();

    const { mutate, isPending } = api.category.create.useMutation({
        onSuccess: () => {
            setName('')
            setDescription('')
            setType('product')
            setColor('#F5C518')
            setOpen(false);
            utils.category.list.invalidate();
            toast.success('Categoría creada exitosamente');
        }
    })

    const handleSubmit = () => {
        const categoryData = {
            name,
            description,
            type,
            color,
        }
        const parsedData = categorySchema.safeParse(categoryData)
        if (!parsedData.success) {
            const errorMessages = parsedData.error.issues[0]?.message
            toast.error(errorMessages);
            return;
        }
        mutate(categoryData)
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="primary" />}>
                <Plus className="w-4 h-4 mr-2" />
                Crear categoría
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="font-semibold">
                        Crear categoría
                    </DialogTitle>
                    <DialogDescription>
                        Creá una nueva categoría para organizar tus productos y servicios. Las categorías te permiten agrupar tus productos y servicios de manera más eficiente.
                    </DialogDescription>
                    <Separator />
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium leading-none">
                            Nombre
                        </Label>
                        <Input
                            id="name"
                            placeholder="Ej: Bebidas, Comida, Limpieza"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium leading-none">
                            Descripción (Opcional)
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Ej: Categoría para bebidas y refrescos"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                        
                    <div className="space-y-2">
                        <Label htmlFor="type" className="text-sm font-medium leading-none">
                            Tipo
                        </Label>

                        <Select items={typeOptions} value={type} onValueChange={(value) => setType(value as 'product' | 'service')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccioná un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {typeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="color" className="text-sm font-medium leading-none">
                            Color
                        </Label>
                        <div className="flex items-center gap-2">
                            <input
                            id="color"
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="h-9 w-9 rounded-md border border-gray-200 cursor-pointer"
                            />
                            <span className="text-sm text-gray-500">{color}</span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="primary" disabled={isPending} className="w-full" onClick={handleSubmit}>
                        {isPending ? 'Creando...' : 'Crear categoría'}
                    </Button>  
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}   
