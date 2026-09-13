'use client'

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { z } from "zod"
import { Plus, Search, SearchX, ShieldCheck, Sparkles } from "lucide-react"
import { api } from "@/lib/trpc"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

const roleSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
})

const CreateRoleForm = () => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [open, setOpen] = useState(false)

  const utils = api.useUtils()

  const { mutate, isPending } = api.roles.create.useMutation({
    onSuccess: () => {
      setName("")
      setDescription("")
      setOpen(false)
      utils.roles.list.invalidate()
      toast.success("Rol creado exitosamente")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = () => {
    const roleData = { name, description }
    const parsedData = roleSchema.safeParse(roleData)
    if (!parsedData.success) {
      const errorMessages = parsedData.error.issues[0]?.message
      toast.error(errorMessages)
      return
    }
    mutate(parsedData.data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="primary" className="w-full" />}>
        <Plus className="w-4 h-4 mr-2" />
        Crear rol
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-semibold">Crear rol</DialogTitle>
          <DialogDescription>
            Creá un nuevo rol para tu equipo. Vas a poder definir sus permisos después de crearlo.
          </DialogDescription>
          <Separator />
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="role-name" className="text-sm font-medium leading-none">
              Nombre
            </Label>
            <Input
              id="role-name"
              placeholder="Ej: Supervisor"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="role-description" className="text-sm font-medium leading-none">
              Descripción (Opcional)
            </Label>
            <Textarea
              id="role-description"
              placeholder="Ej: Supervisa el equipo de ventas y turnos"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="primary" disabled={isPending} className="w-full" onClick={handleSubmit}>
            {isPending ? "Creando..." : "Crear rol"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const RolesView = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const search = searchParams.get("search") ?? ""

  const [searchInput, setSearchInput] = useState(search)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [localPermissions, setLocalPermissions] = useState<string[]>([])

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
    updateSearchParams({ search: value || null })
  }, 400)

  const utils = api.useUtils()

  const [data] = api.roles.list.useSuspenseQuery({
    page: 1,
    limit: 100,
    search: search || undefined,
  })

  const [availablePermissions] = api.roles.getAvailablePermissions.useSuspenseQuery()

  const roles = data.items

  useEffect(() => {
    if ((!selectedRoleId || !roles.some((role) => role.id === selectedRoleId)) && roles.length > 0) {
      setSelectedRoleId(roles[0]!.id)
    }
  }, [roles, selectedRoleId])

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null

  useEffect(() => {
    setLocalPermissions(selectedRole?.permissions ?? [])
  }, [selectedRole?.id])

  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, (typeof availablePermissions)[number][]>()
    availablePermissions.forEach((permission) => {
      const existing = groups.get(permission.group) ?? []
      groups.set(permission.group, [...existing, permission])
    })
    return Array.from(groups.entries())
  }, [availablePermissions])

  const seedDefaults = api.roles.seedDefaults.useMutation({
    onSuccess: (result) => {
      utils.roles.list.invalidate()
      if (result.seeded) {
        toast.success("Roles predeterminados creados")
      } else {
        toast.error("message" in result ? result.message : "No se pudieron crear los roles")
      }
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateRole = api.roles.update.useMutation({
    onSuccess: () => {
      utils.roles.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const debouncedUpdatePermissions = useDebouncedCallback((roleId: string, permissions: string[]) => {
    updateRole.mutate(
      { id: roleId, permissions },
      { onSuccess: () => toast.success("Permisos actualizados") }
    )
  }, 600)

  const togglePermission = (key: string, checked: boolean) => {
    if (!selectedRole) return
    const next = checked
      ? [...localPermissions, key]
      : localPermissions.filter((permission) => permission !== key)
    setLocalPermissions(next)
    debouncedUpdatePermissions(selectedRole.id, next)
  }

  return (
    <div className="px-6 sm:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-yellow-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-xl leading-tight">Roles y Permisos</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestioná los roles de tu equipo y definí qué puede hacer cada uno con el sistema.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-6">
        <div className="w-full lg:w-[340px] shrink-0 space-y-4">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar rol..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  debouncedSearch(e.target.value)
                }}
              />
            </div>
            <CreateRoleForm />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {roles.length === 0 ? (
              <Empty className="border border-dashed border-gray-200 rounded-xl bg-white py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    {search ? <SearchX /> : <Sparkles />}
                  </EmptyMedia>
                  <EmptyTitle>
                    {search ? "No se encontraron resultados" : "No hay roles aún"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {search
                      ? "Intenta con otra búsqueda"
                      : "Creá los roles predeterminados para empezar rápido"}
                  </EmptyDescription>
                </EmptyHeader>
                {!search && (
                  <Button
                    variant="primary"
                    disabled={seedDefaults.isPending}
                    onClick={() => seedDefaults.mutate()}
                  >
                    {seedDefaults.isPending ? "Creando roles..." : "Crear roles predeterminados"}
                  </Button>
                )}
              </Empty>
            ) : (
              roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRoleId(role.id)}
                  className={cn(
                    "w-full text-left bg-white border rounded-xl p-4 transition-colors",
                    role.id === selectedRoleId
                      ? "border-blue-600 ring-1 ring-BLUE-600 bg-blue-100"
                      : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <p className=" text-blue-900 font-semibold text-sm truncate">{role.name}</p>
                  {role.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {role.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {role.permissions.length} permisos
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 w-full min-w-0 bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          {!selectedRole ? (
            <Empty className="py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShieldCheck />
                </EmptyMedia>
                <EmptyTitle>Seleccioná un rol</EmptyTitle>
                <EmptyDescription>
                  Elegí un rol de la lista para ver y editar sus permisos.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">{selectedRole.name}</h4>
                {selectedRole.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{selectedRole.description}</p>
                )}
              </div>

              <Separator />

              <Accordion multiple defaultValue={groupedPermissions.map(([group]) => group)}>
                {groupedPermissions.map(([group, permissions]) => (
                  <AccordionItem key={group} value={group}>
                    <AccordionTrigger>
                      <span className="text-sm font-medium text-gray-900">{group}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        {permissions.map((permission) => (
                          <div
                            key={permission.key}
                            className="flex items-center justify-between gap-3 py-1"
                          >
                            <span className="text-sm text-gray-700">{permission.label}</span>
                            <Switch
                              checked={localPermissions.includes(permission.key)}
                              onCheckedChange={(checked) => togglePermission(permission.key, checked)}
                            />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
