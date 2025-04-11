import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "../../../../db/instance";
import ProductClient from "./productClient";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.producto.findUnique({
    where: { id: params.id },
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

  if (!product) {
    console.log("producto no encontrado.");
    return;
  }

  const obtenerStockTotalproduct = async (productId: string) => {
    const variaciones = await prisma.variacionProducto.findMany({
      where: {
        productoId: productId,
      },
      select: {
        stock: true,
      },
    });

    const stockTotal = variaciones.reduce((total, variacion) => {
      return total + variacion.stock;
    }, 0);

    return stockTotal;
  };

  const stock = await obtenerStockTotalproduct(product?.id || "");

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container p-6">
        <Link
          href="/productos"
          className="inline-flex items-center text-sm mb-6 hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a productos
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={product?.imagenPrincipal || "/placeholder.svg"}
              alt={product?.nombre ?? ""}
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div>
              <h1 className="text-2xl font-bold">{product?.nombre}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {product?.categoria.nombre}
              </p>
            </div>
            {/* 
            <div className="mt-4">
              <p className="text-2xl font-semibold">
                ${product?.precio.toLocaleString("es-CO")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {stock > 0 ? `${stock} disponibles` : "Sin stock"}
              </p>
            </div> */}

            <Separator className="my-6" />

            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Descripción</h3>
                <p className="text-sm text-muted-foreground">
                  {product?.descripcion}
                </p>
              </div>

              {/* Pass product data to the client component */}
              <ProductClient product={product} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
