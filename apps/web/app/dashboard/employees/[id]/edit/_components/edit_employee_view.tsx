'use client'

import { api } from "@/lib/trpc"
import { EmployeeFormView } from "../../../_components/employee_form_view"

type EditEmployeeViewProps = {
    employeeId: string
}

export const EditEmployeeView = ({ employeeId }: EditEmployeeViewProps) => {
    const [employee] = api.businessMembers.getById.useSuspenseQuery({ id: employeeId })

    return <EmployeeFormView mode='edit' employee={employee} />
}
