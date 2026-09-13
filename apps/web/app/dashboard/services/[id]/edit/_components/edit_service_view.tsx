'use client'

import { api } from "@/lib/trpc"
import { ServiceFormView } from "../../../_components/service_form_view"

type EditServiceViewProps = {
    serviceId: string
}

export const EditServiceView = ({ serviceId }: EditServiceViewProps) => {
    const [service] = api.services.getById.useSuspenseQuery({ id: serviceId})

    return <ServiceFormView mode='edit' service={service} />
}