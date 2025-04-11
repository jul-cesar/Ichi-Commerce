export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { prisma } from "../../../../db/instance";
import { columns } from "./data-table/columns";
import { DataTable } from "./data-table/data-table";

export default async function ProductsPage() {
  const products = await prisma.producto.findMany({
    include: {
      categoria: true,
      variaciones: {
        include: {
          atributos: {
            include: {
              valorAtributo: {
                include: {
                  atributo: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
        <div className="flex  xs:flex-row gap-2">
          <Button asChild variant="outline" className="w-auto">
            <Link href="/admin/atributos">Gestionar Atributos</Link>
          </Button>
          <Button asChild className="flex-1 xs:flex-none">
            <Link href="/admin/productos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo producto
            </Link>
          </Button>
        </div>
      </div>

      <div className="overflow-auto rounded-md border">
        <DataTable
          columns={columns}
          data={products.map((product) => ({
            id: product.id,
            nombre: product.nombre,
            categoria: product.categoria,
            precio: product.precio,
            variaciones: product.variaciones,
            product: product, // Pass the full product for actions
          }))}
        />
      </div>
    </div>
  );
}
