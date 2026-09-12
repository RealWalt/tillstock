'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/trpc"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

const supplierSchema = z.object({
    name: z.string().min(2, 'Nombre invalido'),
    contactName: z.string().min(2, 'Nombre de contacto invalido'),
    phone: z.string().min(2, 'Numero  de telefono invalido'),
    email: z.string().optional(),
    ruc: z.string().optional(),
    description: z.string().optional()
})

type SupplierFieldsProps = {
    name: string
    setName: (value: string) => void
    contactName: string
    setContactName: (value: string) => void
    phone: string
    setPhone: (value: string) => void
    email: string
    setEmail: (value: string) => void
    ruc: string
    setRuc: (value: string) => void
    description: string
    setDescription: (value: string) => void
}

const SupplierFields = ({
    name, setName,
    contactName, setContactName,
    phone, setPhone,
    email, setEmail,
    ruc, setRuc,
    description, setDescription,
}: SupplierFieldsProps) => {
    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium leading-none">
                    Nombre de la empresa
                </Label>
                <Input
                    id="name"
                    placeholder="Ej: Distribuidora Del Este S.A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                <Label htmlFor="contactName" className="text-sm font-medium leading-none">
                    Nombre del contacto o vendedor
                </Label>
                <Input
                    id="contactName"
                    placeholder="Ej: Enzo Zurzolo"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-medium leading-none">
                    Telefono
                </Label>
                <Input
                    id="phone"
                    placeholder="Ej: 975-(588)-353"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium leading-none">
                    Email (Opcional)
                </Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="Ej: distribuidoradeleste@company.com.py"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                <Label htmlFor="ruc" className="text-sm font-medium leading-none">
                    RUC
                </Label>
                <Input
                    id="ruc"
                    placeholder="Ej: 800123522-8"
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-medium leading-none">
                    Descripcion
                </Label>
                <Textarea
                    id="description"
                    placeholder="Ej: Proveedor de Electronicos"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
        </div>
    )
}

export const SupplierForm = () => {
    const [name, setName] = useState('')
    const [contactName, setContactName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [ruc, setRuc] = useState('')
    const [description, setDescription] = useState('')

    const [open, setOpen] = useState(false)

    const utils = api.useUtils()
    const { mutate, isPending} = api.supplier.create.useMutation({
        onSuccess: () => {
            setName('')
            setContactName('')
            setPhone('')
            setEmail('')
            setRuc('')
            setDescription('')
            setOpen(false)
            utils.supplier.list.invalidate();
            toast.success('Proveedor agregado correctamente.')
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const handleCreate = () => {
        const supplierData = {
            name,
            contactName,
            email,
            phone,
            description,
            ruc,
        }
        const parsedData = supplierSchema.safeParse(supplierData)
        if(!parsedData.success) {
            const errorMessage = parsedData.error.issues[0]?.message;
            toast.error(errorMessage)
            return;
        }

        mutate(supplierData)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant='primary' />}>
                Agregar Proveedor
            </DialogTrigger>
            <DialogContent className='sm:max-w-xl'>
                <DialogHeader>
                    <DialogTitle>Agregar Proveedor</DialogTitle>
                    <Separator />
                </DialogHeader>

                <SupplierFields
                    name={name}
                    setName={setName}
                    contactName={contactName}
                    setContactName={setContactName}
                    phone={phone}
                    setPhone={setPhone}
                    email={email}
                    setEmail={setEmail}
                    ruc={ruc}
                    setRuc={setRuc}
                    description={description}
                    setDescription={setDescription}
                />

                <Button onClick={handleCreate} variant='primary' disabled={isPending} className='w-full'>
                    {isPending ? 'Agregando...' : 'Agregar Proveedor'}
                </Button>
            </DialogContent>
        </Dialog>
    )
}

type EditableSupplier = {
    id: string
    name: string
    contactName: string | null
    phone: string | null
    email: string | null
    ruc: string | null
    description: string | null
}

type EditSupplierFormProps = {
    supplier: EditableSupplier | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const EditSupplierForm = ({ supplier, open, onOpenChange }: EditSupplierFormProps) => {
    const [name, setName] = useState('')
    const [contactName, setContactName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [ruc, setRuc] = useState('')
    const [description, setDescription] = useState('')

    const utils = api.useUtils()

    useEffect(() => {
        if (supplier) {
            setName(supplier.name)
            setContactName(supplier.contactName ?? '')
            setPhone(supplier.phone ?? '')
            setEmail(supplier.email ?? '')
            setRuc(supplier.ruc ?? '')
            setDescription(supplier.description ?? '')
        }
    }, [supplier])

    const { mutate, isPending } = api.supplier.update.useMutation({
        onSuccess: () => {
            onOpenChange(false)
            utils.supplier.list.invalidate();
            toast.success('Proveedor actualizado correctamente.')
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const handleUpdate = () => {
        if (!supplier) return
        const supplierData = {
            name,
            contactName,
            email,
            phone,
            description,
            ruc,
        }
        const parsedData = supplierSchema.safeParse(supplierData)
        if(!parsedData.success) {
            const errorMessage = parsedData.error.issues[0]?.message;
            toast.error(errorMessage)
            return;
        }

        mutate({ id: supplier.id, ...supplierData })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-xl'>
                <DialogHeader>
                    <DialogTitle>Editar Proveedor</DialogTitle>
                    <Separator />
                </DialogHeader>

                <SupplierFields
                    name={name}
                    setName={setName}
                    contactName={contactName}
                    setContactName={setContactName}
                    phone={phone}
                    setPhone={setPhone}
                    email={email}
                    setEmail={setEmail}
                    ruc={ruc}
                    setRuc={setRuc}
                    description={description}
                    setDescription={setDescription}
                />

                <Button onClick={handleUpdate} variant='primary' disabled={isPending} className='w-full'>
                    {isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
            </DialogContent>
        </Dialog>
    )
}
