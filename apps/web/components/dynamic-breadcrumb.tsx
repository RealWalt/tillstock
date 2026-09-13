'use client';

import { usePathname } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { Fragment } from "react";
import Link from "next/link";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Productos",
  categories: "Categorías",
  suppliers: "Proveedores",
  services: "Servicios",
  new: "Crear nuevo",
  edit: "Editar producto",
}

const isDynamicId = (segment: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)

export const DynamicBreadcrumb = () => {
    const pathname = usePathname()
    const segments = pathname.split('/').filter((segment) => segment && !isDynamicId(segment)) // ["dashboard", "products", "new"]

    return (
        <Breadcrumb>
            <BreadcrumbList>
            {segments.map((segment, index) => {
                const href = "/" + segments.slice(0, index + 1).join("/")
                const isLast = index === segments.length - 1
                const label = labelMap[segment] ?? segment


                return (
                    <Fragment key={href}>
                        <BreadcrumbItem>
                        {isLast ? (
                            <BreadcrumbPage>{label}</BreadcrumbPage>

                        ) : (
                            <BreadcrumbLink className="bg-blue-100 p-1.5 rounded-md text-blue-600" render={<Link href={href} />}>{label}</BreadcrumbLink>
                        )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                    </Fragment>
                )
            })}
            </BreadcrumbList>
        </Breadcrumb>
    )
} 