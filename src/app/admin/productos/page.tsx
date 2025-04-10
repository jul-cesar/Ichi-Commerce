import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { prisma } from "../../../../db/instance";
import { DataTable } from "./data-table/data-table";
import { columns } from "./data-table/columns";


export const dynamic = "force-dynamic";

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/atributos">Gestionar Atributos</Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/productos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo producto
            </Link>
          </Button>
        </div>
      </div>

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
  );
}
