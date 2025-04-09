import { ProductActions } from "@/components/product-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VariationsList } from "@/components/variations-list";
import { Plus } from "lucide-react";
import Link from "next/link";
import { prisma } from "../../../../db/instance";

export const dynamic = "force-dynamic";

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

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/atributos">Gestionar Atributos</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/productos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo producto
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio Base</TableHead>
              <TableHead className="w-[300px]">Variaciones</TableHead>
              {/* <TableHead>Estado</TableHead> */}
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.nombre}</TableCell>
                <TableCell>
                  <Badge variant="outline">{product.categoria.nombre}</Badge>
                </TableCell>
                <TableCell>${product.precio.toLocaleString("es-CO")}</TableCell>

                {/* Variaciones y stock */}
                <TableCell>
                  <VariationsList product={product} />
                </TableCell>

                {/* Estado */}
                {/* <TableCell>
                  <Badge variant={product.activo ? "default" : "secondary"}>
                    {product.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell> */}

                {/* Acciones */}
                <TableCell className="text-right">
                  <ProductActions product={product} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
