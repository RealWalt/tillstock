"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Folder, MoreVertical, Package, Pencil, Search, SearchX, SquareChartGantt, Wrench } from "lucide-react";
import { CreateCategoryForm } from "./category_form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { api } from "@/lib/trpc";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { PAGE_SIZE } from "../constants";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const typesFilter = [
  { label: "Todas", value: "all" },
  { label: "Servicios", value: "service" },
  { label: "Productos", value: "product" },
] as const;

const typeIcons = {
  product: Package,
  service: Wrench,
}


export const CategoriesView = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "all";

  const [searchInput, setSearchInput] = useState(search);

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateSearchParams({ search: value, page: "1", type: "all" });
  }, 400);

  const [data] = api.category.list.useSuspenseQuery({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    type: type !== 'all' ? (type as 'product' | 'service') : undefined,
  })

  return (
    <div className="px-6 sm:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
          <Folder className="h-5 w-5 text-yellow-500" />
        </div>
        <div>
          <h3 className="text-gray-900 font-semibold text-xl leading-tight">
            Categorías
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organizá y gestioná tus productos por categoría.
          </p>
        </div>
      </div>

      <div>
        {/* Acá van las cards */}
        Cards
      </div>

      <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Buscar categorías..." 
            className="pl-9" value={searchInput} 
            onChange={(e) => {
              setSearchInput(e.target.value)
              debouncedSearch(e.target.value)
            }} />
        </div>

        <Select items={typesFilter} value={type} onValueChange={(value) => updateSearchParams({ type: value, page: "1" })} defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {typesFilter.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CreateCategoryForm />
      </div>
      
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant='icon'>
                        { search ? <SearchX /> : <Folder />}
                      </EmptyMedia>
                      <EmptyTitle>
                        { search ? "No se encontraron resultados" : "No hay categorías aún" }
                      </EmptyTitle>
                      <EmptyDescription>
                        { search 
                        ? "Intenta con otra búsqueda" 
                        : "Crea tu primera categoría para organizar tus productos" }
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((category) => {
                const Icon = typeIcons[category.type]
                return (
                  
                  <TableRow key={category.id} className="hover:bg-gray-50">
                  <TableCell className="flex items-center gap-3">
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                      >
                      <Icon className="h-4 w-4" style={{ color: category.color }} />
                    </div>
                    <Link href={`/dashboard/categories/${category.id}`}>
                      {category.name}
                    </Link>
                  </TableCell>
                  <TableCell>{category.description || "-"}</TableCell>
                  <TableCell>{category.type === 'product' ? "Producto" : "Servicio"}</TableCell>
                  <TableCell>
                    <Badge className={category.isActive ? "bg-green-100 text-green-800" : "bg-orange-100 text-red-800"}>
                      {category.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Button variant='outline'>
                      <Pencil />
                    </Button>
                    <Button variant='outline'>
                      <SquareChartGantt />
                    </Button>
                    <Button variant='outline'>
                      <MoreVertical />
                    </Button>
                  </TableCell>
                </TableRow>
                )})
              )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Mostrando {data.items.length} de {data.total} categorías
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant='default'
            size='icon'
            disabled={page === 1}
            onClick={() => updateSearchParams({ page: (page - 1).toString() })}
          >
            <ChevronLeft />
          </Button>
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "primary" : "outline"}
              size='icon'
              onClick={() => updateSearchParams({ page: p.toString() })}
            >
              {p}
            </Button>
          ))}
          <Button
            variant='default'
            size='icon'
            disabled={page === data.totalPages}
            onClick={() => updateSearchParams({ page: (page + 1).toString() })}
          >
            <ChevronRight  />
          </Button>
        </div>
      </div>
    </div>
    
  );
};
