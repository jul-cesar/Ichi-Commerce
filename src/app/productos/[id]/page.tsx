import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Truck } from "lucide-react";
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

  // Hardcoded original price (for promotion display)

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {/* Product Image - Fixed on desktop */}
          <div className="aspect-square overflow-hidden rounded-lg bg-muted md:sticky md:top-6 md:self-start relative">
            <Badge className="absolute top-4 left-4 z-10 bg-red-500 hover:bg-red-600">
              PROMOCIÓN
            </Badge>
            <Image
              src={product?.imagenPrincipal || "/placeholder.svg"}
              alt={product?.nombre ?? ""}
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Product Details - Scrollable */}
          <div className="flex flex-col">
            <div>
              <h1 className="text-2xl font-bold">{product?.nombre}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {product?.categoria.nombre}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-xl line-through text-muted-foreground">
                  ${product.precioPromo.toLocaleString("es-CO")}
                </p>
                <p className="text-xl font-semibold text-muted-foreground">
                  ${product.precio.toLocaleString("es-CO")}
                </p>
                {/* <Badge
                  variant="outline"
                  className="text-red-500 border-red-500"
                >
                  -100%
                </Badge> */}
              </div>
              {/* <p className="text-3xl font-bold text-green-600">GRATIS</p> */}
              <p className="text-sm text-muted-foreground">
                {stock > 0 ? `${stock} disponibles` : "Sin stock"}
              </p>

              <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                <Truck className="size-7 text-blue-500" />
                <p className="text-md font-medium text-blue-700">
                  Contraentrega gratuita en toda Colombia
                </p>
              </div>
            </div>

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

              <div className="bg-green-50 p-4 rounded-md border border-green-100">
                <h3 className="font-medium text-green-800 mb-2">
                  ¡Oferta por tiempo limitado!
                </h3>
                <p className="text-md text-green-700">
                  Esta promoción especial incluye envío gratuito a cualquier
                  ciudad de Colombia. Aprovecha esta oportunidad única y haz tu
                  pedido ahora.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
