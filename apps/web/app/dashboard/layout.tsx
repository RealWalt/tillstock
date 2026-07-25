'use client';

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Clock, FileText, FolderTree, LayoutGrid, MonitorSmartphone, Package, Receipt, Settings, ShieldCheck, Store, Truck, UserCog, Users, WalletCards, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navSections = [
    {
        title: 'GESTIÓN',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
            { label: "Categorías", href: "/dashboard/categories", icon: FolderTree },
            { label: "Proveedores", href: "/dashboard/suppliers", icon: Truck },
            { label: "Productos", href: "/dashboard/products", icon: Package },
            { label: "Servicios", href: "/dashboard/services", icon: Wrench },
        ]
    }, {
        title: 'VENTAS',
        items: [
            { label: "POS", href: "/dashboard/pos", icon: MonitorSmartphone },
            { label: "Transacciones", href: "/dashboard/transactions", icon: Receipt },
            { label: "Turnos de caja", href: "/dashboard/shifts", icon: Clock },
        ]
    }, {
        title: "PERSONAL",
        items: [
        { label: "Empleados", href: "/dashboard/employees", icon: Users },
        { label: "Cajeros", href: "/dashboard/cashiers", icon: UserCog },
        { label: "Roles y permisos", href: "/dashboard/roles", icon: ShieldCheck },
        { label: "Cajas POS", href: "/dashboard/pos-terminals", icon: Store },
        ]
    },
    {
        title: "REPORTES",
        items: [
        { label: "Reportes", href: "/dashboard/reports", icon: FileText },
        { label: "Gastos", href: "/dashboard/expenses", icon: WalletCards },
        ]
    },
    {
        title: "CONFIGURACIÓN",
        items: [
        { label: "Mi comercio", href: "/dashboard/settings", icon: Settings },
        ]
    }
]
export default function DashboardLayout({ children }: {children: React.ReactNode}) {
    const pathname = usePathname()

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader className=" flex justify-center items-center">    
                    <Image src="/tillstock-logo-white.svg" alt="Tillstock" width={200} height={80} />
                </SidebarHeader>
                <SidebarContent>
                    {navSections.map((section) => (
                        <SidebarGroup key={section.title}>
                            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                            <SidebarGroupContent>{section.items.map((item) => {
                                const Icon = item.icon
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton isActive={pathname === item.href} render={<Link href={item.href} />}>
                                            <Icon />
                                            <span>{item.label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}</SidebarGroupContent>
                        </SidebarGroup>
                    ))}
                </SidebarContent>

                <SidebarFooter>
                </SidebarFooter>
                
            </Sidebar>
                <SidebarInset>
                    <header className="flex items-center gap-2 p-4 border-b">
                        <SidebarTrigger />
                    </header>
                    {children}
                </SidebarInset>
        </SidebarProvider>
    )
}