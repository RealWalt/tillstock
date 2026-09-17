'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/trpc"
import { Plus, User, Users, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type OperatorsCardProps = {
    terminalId: string
}

export const OperatorsCard = ({ terminalId }: OperatorsCardProps) => {
    const utils = api.useUtils()
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

    const [operators] = api.posTerminalOperators.listByTerminal.useSuspenseQuery({ posTerminalId: terminalId })
    const [members] = api.businessMembers.list.useSuspenseQuery({ page: 1, limit: 100 })

    const assignedIds = new Set(operators.map((operator) => operator.businessMemberId))
    const memberOptions = members.items
        .filter((member) => member.isActive && !assignedIds.has(member.id))
        .map((member) => ({
            label: member.firstName && member.lastName
                ? `${member.firstName} ${member.lastName}`
                : member.email,
            value: member.id
        }))

    const { mutate: addOperator, isPending: isAdding } = api.posTerminalOperators.addOperator.useMutation({
        onSuccess: () => {
            utils.posTerminalOperators.listByTerminal.invalidate({ posTerminalId: terminalId })
            setSelectedMemberId(null)
            toast.success('Operador agregado correctamente')
        },
        onError: (error) => {
            toast.error('Error al agregar el operador: ' + error.message)
        }
    })

    const { mutate: removeOperator } = api.posTerminalOperators.removeOperator.useMutation({
        onSuccess: () => {
            utils.posTerminalOperators.listByTerminal.invalidate({ posTerminalId: terminalId })
            toast.success('Operador removido correctamente')
        },
        onError: (error) => {
            toast.error('Error al remover el operador: ' + error.message)
        }
    })

    const handleAdd = () => {
        if (!selectedMemberId) return
        addOperator({ posTerminalId: terminalId, businessMemberId: selectedMemberId })
    }

    return (
        <div className="max-w-md border border-gray-200 rounded-xl p-5 space-y-5">
            <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900">Operadores autorizados</h4>
                    <p className="text-sm text-muted-foreground">Empleados que pueden usar esta caja con su PIN</p>
                </div>
            </div>

            <div className="space-y-2">
                {operators.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Todavía no hay operadores asignados a esta caja.</p>
                ) : (
                    operators.map((operator) => {
                        const fullName = operator.firstName && operator.lastName
                            ? `${operator.firstName} ${operator.lastName}`
                            : 'Empleado'

                        return (
                            <div key={operator.id} className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar>
                                        {operator.imageUrl && <AvatarImage src={operator.imageUrl} alt={fullName} />}
                                        <AvatarFallback>
                                            <User className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-gray-900 truncate">{fullName}</span>
                                </div>
                                <Button
                                    variant='outline'
                                    size='icon-sm'
                                    onClick={() => removeOperator({ id: operator.id })}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )
                    })
                )}
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Agregar empleado</p>
                <div className="flex items-center gap-2">
                    <Select
                        items={memberOptions}
                        value={selectedMemberId}
                        onValueChange={(value) => setSelectedMemberId(value ?? null)}
                    >
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Seleccioná un empleado" />
                        </SelectTrigger>
                        <SelectContent>
                            {memberOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant='primary'
                        size='icon'
                        disabled={!selectedMemberId || isAdding}
                        onClick={handleAdd}
                        className="bg-[#F5C518] hover:bg-[#e0b412] text-[#0F1E3C]"
                    >
                        <Plus />
                    </Button>
                </div>
            </div>
        </div>
    )
}
