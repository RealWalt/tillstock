'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/trpc"
import { useUploadThing } from "@/lib/uploadthing"
import { CloudUpload, ImageIcon, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

const employeeSchema = z.object({
    firstName: z.string().min(1, 'El nombre es obligatorio'),
    lastName: z.string().min(1, 'El apellido es obligatorio'),
    cedula: z.string().min(1, 'La cédula es obligatoria'),
    roleId: z.uuid('Seleccioná un rol'),
    salary: z.number().int().optional(),
    imageUrl: z.string().optional(),
})

const createEmployeeSchema = employeeSchema.extend({
    email: z.string().min(1, 'El email es obligatorio'),
})

export type EmployeeFormData = {
    id: string
    roleId: string
    firstName: string | null
    lastName: string | null
    cedula: string | null
    salary: number | null
    imageUrl: string | null
    isActive: boolean
    email: string
}

type EmployeeFormViewProps = {
    mode: 'create' | 'edit'
    employee?: EmployeeFormData
}

export const EmployeeFormView = ({ mode, employee }: EmployeeFormViewProps) => {
    const router = useRouter()

    const [roles] = api.roles.list.useSuspenseQuery({ page: 1, limit: 100 })
    const roleOptions = roles.items.map((role) => ({
        label: role.name,
        value: role.id
    }))

    const [firstName, setFirstName] = useState(employee?.firstName ?? '')
    const [lastName, setLastName] = useState(employee?.lastName ?? '')
    const [cedula, setCedula] = useState(employee?.cedula ?? '')
    const [email, setEmail] = useState(employee?.email ?? '')
    const [roleId, setRoleId] = useState<string | null>(employee?.roleId ?? null)
    const [salary, setSalary] = useState(employee?.salary ? String(employee.salary) : '')

    const [imageUrl, setImageUrl] = useState<string | undefined>(employee?.imageUrl ?? undefined)
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(employee?.imageUrl ?? undefined)

    const { startUpload, isUploading } = useUploadThing('employeeImage', {
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

    const { mutate: createEmployee, isPending: isCreating } = api.businessMembers.create.useMutation({
        onSuccess: () => {
            utils.businessMembers.list.invalidate()
            toast.success('Empleado creado correctamente')
            router.push('/dashboard/employees')
        },
        onError: (error) => {
            toast.error('Error al crear el empleado: ' + error.message)
        }
    })

    const { mutate: updateEmployee, isPending: isUpdating } = api.businessMembers.update.useMutation({
        onSuccess: () => {
            utils.businessMembers.list.invalidate()
            utils.businessMembers.getById.invalidate({ id: employee?.id })
            toast.success('Empleado actualizado correctamente')
            router.push('/dashboard/employees')
        },
        onError: (error) => {
            toast.error('Error al actualizar el empleado: ' + error.message)
        }
    })

    const isPending = mode === 'create' ? isCreating : isUpdating

    const handleSubmit = () => {
        const baseValues = {
            firstName,
            lastName,
            cedula,
            roleId: roleId ?? undefined,
            salary: salary ? Number(salary) : undefined,
            imageUrl: imageUrl ?? undefined,
        }

        if (mode === 'create') {
            const result = createEmployeeSchema.safeParse({ ...baseValues, email })

            if (!result.success) {
                const errorMessage = result.error.issues[0]?.message
                toast.error('Error al crear el empleado: ' + errorMessage)
                return
            }

            createEmployee(result.data)
        } else if (employee) {
            const result = employeeSchema.safeParse(baseValues)

            if (!result.success) {
                const errorMessage = result.error.issues[0]?.message
                toast.error('Error al actualizar el empleado: ' + errorMessage)
                return
            }

            updateEmployee({ id: employee.id, ...result.data })
        }
    }

    return (
        <div className="px-6 sm:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-gray-900 font-semibold text-xl leading-tight">
                        {mode === 'create' ? 'Agregar nuevo empleado' : 'Editar empleado'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {mode === 'create'
                            ? 'Completa la información para agregar un nuevo empleado a tu equipo'
                            : 'Actualizá la información de tu empleado'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant='primary' disabled={isPending || isUploading} onClick={handleSubmit}>
                        <CloudUpload className="h-4 w-4" />
                        {mode === 'create' ? 'Crear empleado' : 'Guardar cambios'}
                    </Button>
                </div>
            </div>

            {/*Columna 1 */}
            <div className="flex items-start w-xl gap-x-10 justify-between">
                <div className="flex-1 space-y-6">
                    <h3 className="font-bold">Información básica</h3>

                    <div className="flex gap-2">
                        <div className="space-y-3">
                            <Label>Nombre <span className="text-red-600 font-bold">*</span></Label>
                            <Input
                                placeholder="Ej: Juan"
                                className="rounded-sm"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Apellido <span className="text-red-600 font-bold">*</span></Label>
                            <Input
                                placeholder="Ej: Pérez"
                                className="rounded-sm"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Cédula <span className="text-red-600 font-bold">*</span></Label>
                        <Input
                            placeholder="Ej: 4123456"
                            className="w-sm rounded-sm"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Email {mode === 'create' && <span className="text-red-600 font-bold">*</span>}</Label>
                        <Input
                            type="email"
                            placeholder="empleado@ejemplo.com"
                            className="w-sm rounded-sm"
                            value={email}
                            disabled={mode === 'edit'}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            {mode === 'edit'
                                ? 'El email no se puede modificar porque está vinculado a la cuenta del usuario.'
                                : 'Email del empleado. La invitación automática todavía no está disponible.'}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <Label>Rol <span className="text-red-600 font-bold">*</span></Label>
                        <Select
                            items={roleOptions}
                            value={roleId}
                            onValueChange={(value) => setRoleId(value ?? null)}
                        >
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Seleccioná un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                {roleOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label>Salario (opcional)</Label>
                        <Input
                            type="number"
                            placeholder="Ej: 3000000"
                            className="w-44"
                            min={0}
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Uso interno. No se muestra en el punto de venta ni es visible para el empleado.
                        </p>
                    </div>
                </div>

                <div className="w-80 shrink-0 space-y-5">
                    <div>
                        <h3 className="text-gray-900 font-semibold">Foto del empleado</h3>
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
