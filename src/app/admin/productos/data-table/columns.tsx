"use client";

import { ProductActions } from "@/components/product-actions";
import { Badge } from "@/components/ui/badge";
import { VariationsList } from "@/components/variations-list";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-coloumn-header";

// Define the type for our data
export type ProductData = {
  id: string;
  nombre: string;
  categoria: {
    id: string;
    nombre: string;
  };
  precio: number;
  variaciones: any[];
  product: any; // Full product object for actions
};

export const columns: ColumnDef<ProductData>[] = [
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("nombre")}</div>
    ),
  },
  {
    accessorKey: "categoria",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoría" />
    ),
    cell: ({ row }) => {
      const categoria = row.getValue("categoria") as { nombre: string };
      return <Badge variant="outline">{categoria.nombre}</Badge>;
    },
    filterFn: (row: any, id, value) => {
      return value.includes(row.getValue(id).nombre);
    },
  },
  {
    accessorKey: "precio",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precio Base" />
    ),
    cell: ({ row }) => {
      const precio = Number.parseFloat(row.getValue("precio"));
      return <div>${precio.toLocaleString("es-CO")}</div>;
    },
  },
  {
    accessorKey: "variaciones",
    header: "Variaciones",
    cell: ({ row }) => <VariationsList product={row.original.product} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductActions product={row.original.product} />,
    enableSorting: false,
    enableHiding: false,
  },
];
