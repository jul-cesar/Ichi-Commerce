import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Star, Truck, Users } from "lucide-react";
import Link from "next/link";
import { prisma } from "../../../../db/instance";

import DeliveryTimeline from "../delivery-timeline";
import ImageSlider from "../image-slider";
import ReviewsSection from "../reviews-section";
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
          imagenes: true,
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

  // Fake product images for the slider
  const productImages = [
    product?.imagenPrincipal || "/placeholder.svg",
    ...product.variaciones.flatMap(
      (variacion) => variacion.imagenes.map((img) => img.url) || []
    ), // Include images from variations
  ];

  // Calculate discount percentage
  const discountPercentage = Math.round(
    ((product.precioPromo - product.precio) / product.precioPromo) * 100
  );

  // Fake purchase count
  const purchaseCount = 187;

  // Recent buyers (fake data)
  const recentBuyers = [
    { name: "María", verified: true },
    { name: "Carlos", verified: false },
    { name: "Ana", verified: true },
  ];

  return (
    <main className="flex min-h-screen flex-col">
      {/* Limited time offer banner */}
      <div className="bg-red-600 text-white py-2 px-4 text-center font-bold tracking-wide animate-pulse">
        ¡OFERTA POR TIEMPO LIMITADO! • SOLO QUEDAN {stock} UNIDADES • ENVÍO
        GRATIS POR 2 DÍAS •
      </div>

      <div className="container p-6">
        <Link
          href="/productos"
          className="inline-flex items-center text-sm mb-6 hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a productos
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {/* Product Image Slider - Fixed on desktop */}
          <div className="md:sticky md:top-6 md:self-start">
            <div className="relative">
              <Badge className="absolute top-4 left-4 z-10 bg-red-500 hover:bg-red-600">
                PROMOCIÓN
              </Badge>
              <ImageSlider images={productImages} />
            </div>

            {/* Rating stars */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm font-medium">(196 Reseñas)</span>
            </div>
          </div>

          {/* Product Details - Scrollable */}
          <div className="flex flex-col">
            <div>
              <h1 className="text-3xl font-bold uppercase">
                {product?.nombre}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {product?.categoria.nombre}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-2xl line-through text-muted-foreground">
                  ${product.precioPromo.toLocaleString("es-CO")}
                </p>
                <p className="text-3xl font-bold text-red-600">
                  ${product.precio.toLocaleString("es-CO")}
                </p>
                <Badge
                  variant="outline"
                  className="text-red-500 border-red-500"
                >
                  -{Math.abs(discountPercentage)}%
                </Badge>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <p className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
                  {stock > 0 ? `¡Solo quedan ${stock} unidades!` : "Sin stock"}
                </p>
              </div>

              {/* Recent buyers */}
              <div className="flex items-center gap-2 mt-4 p-3 bg-gray-50 rounded-md border">
                <Users className="size-5 text-gray-500" />
                <div>
                  <div className="flex items-center gap-1">
                    {recentBuyers.map((buyer, index) => (
                      <span
                        key={index}
                        className="flex items-center text-sm font-medium"
                      >
                        {buyer.name}
                        {buyer.verified && (
                          <Badge
                            variant="outline"
                            className="ml-1 h-4 w-4 p-0 flex items-center justify-center"
                          >
                            ✓
                          </Badge>
                        )}
                        {index < recentBuyers.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    y{" "}
                    <span className="font-bold text-black">
                      +{purchaseCount}
                    </span>{" "}
                    personas lo compraron
                  </p>
                </div>
              </div>

              {/* Delivery info */}
              <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                <Truck className="size-7 text-blue-500" />
                <div>
                  <p className="text-md font-medium text-blue-700">
                    Contraentrega gratuita en toda Colombia
                  </p>
                  <p className="text-sm text-blue-600">
                    Recibe en 24-48 horas hábiles
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery timeline */}
            <div className="my-6">
              <DeliveryTimeline />
            </div>

            {/* Add to cart button */}
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-6"
            >
              COMPRAR AHORA
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-2">
              <Clock className="inline-block mr-1 h-4 w-4" />
              Esta oferta termina en:{" "}
              <span className="font-bold">23:59:42</span>
            </div>

            <Separator className="my-6" />

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-3">Descripción</h3>
                <p className="text-sm text-muted-foreground">
                  {product?.descripcion}
                </p>
              </div>

              {/* Pass product data to the client component */}
              <ProductClient
                product={product}
                promoPercentage={discountPercentage}
              />

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

              {/* Satisfaction guarantee */}
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 flex gap-3">
                <div className="text-yellow-600 text-2xl font-bold">✓</div>
                <div>
                  <h3 className="font-medium text-yellow-800 mb-1">
                    100% Garantía de satisfacción
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Si no estás completamente satisfecho con tu compra, te
                    devolvemos tu dinero sin hacer preguntas.
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews section */}
            <div className="mt-8">
              <ReviewsSection />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
