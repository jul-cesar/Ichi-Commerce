import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { prisma } from "../../../../db/instance";

// Cargar productos con sus variaciones y atributos

export const dynamic = "force-dynamic";

const products = await prisma.producto.findMany({
  include: {
    categoria: true,
    variaciones: {
      include: {
        atributos: true,
      },
    },
  },
});

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
        <Button asChild>
          <Link href="/admin/productos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Variaciones</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.nombre}</TableCell>
                <TableCell>{product.categoria.nombre}</TableCell>
                <TableCell>${product.precio.toLocaleString("es-CO")}</TableCell>

                {/* Variaciones y stock */}
                <TableCell>
                  {product.variaciones.length > 0 ? (
                    product.variaciones.map((variacion) => (
                      <div key={variacion.id}>
                        <p className="font-semibold">
                          {variacion.atributos
                            .map(
                              (atributo) =>
                                `${atributo.valor}: ${atributo.nombre}`
                            )
                            .join(", ")}
                        </p>
                        <p>Stock: {variacion.stock}</p>
                      </div>
                    ))
                  ) : (
                    <span>No hay variaciones disponibles</span>
                  )}
                </TableCell>

                {/* Estado */}
                <TableCell>
                  {/* Puedes agregar lógica de estado aquí si corresponde */}
                  {/* Ejemplo: */}
                  {/* <Badge variant={product.estado === "activo" ? "default" : "secondary"}>
                    {product.estado === "activo" ? "Activo" : "Inactivo"}
                  </Badge> */}
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
