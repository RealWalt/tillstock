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
}

export const DynamicBreadcrumb = () => {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean) // ["dashboard", "products", "new"]

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
                            <BreadcrumbLink render={<Link href={href} />}>{label}</BreadcrumbLink>
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