import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, MapPin, Package, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../db/instance";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const orderId = searchParams.order;

  if (!orderId) {
    return notFound();
  }

  // Fetch order data from database using the order ID from URL
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: {
        include: {
          variacion: {
            include: {
              producto: true,
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
      },
    },
  });

  if (!order) {
    return notFound();
  }

  // Format date
  const formattedDate = new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(order.createdAt);

  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.cantidad,
    0
  );

  const totalNeto =
    totalQuantity === 2
      ? order.items.find((item) => item.variacion.producto.precioDosificacion)
          ?.variacion.producto.precioDosificacion ??
        order.items.reduce(
          (total, item) =>
            total + item.cantidad * item.variacion.producto.precio,
          0
        )
      : order.items.reduce(
          (total, item) =>
            total + item.cantidad * item.variacion.producto.precio,
          0
        );

  const subtotalNoPromo = order.items.reduce((total, item) => {
    return total + item.variacion.producto.precio * item.cantidad;
  }, 0);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 md:p-8">
      <div className="w-full max-w-3xl">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-green-100 p-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Pedido Confirmado!
          </h1>
          <p className="mt-2 text-gray-600">
            Gracias por tu compra. Tu pedido ha sido recibido y está siendo
            procesado.
          </p>
        </div>

        <Card className="mb-6 overflow-hidden">
          <div className="bg-primary p-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Detalles del Pedido</h2>
              <span className="rounded-full bg-primary-foreground px-3 py-1 text-xs font-medium text-primary">
                {order.id}
              </span>
            </div>
            <p className="mt-1 text-sm opacity-90">
              Realizado el {formattedDate}
            </p>
          </div>

          <CardContent className="p-6">
            <div className="mb-6 flex flex-col space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <h3 className="font-medium">Dirección de Envío</h3>
                  <p className="text-sm text-gray-600">
                    {order.nombre} {order.apellidos}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.direccionEnvio}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.nombreBarrio}, {order.ciudad}
                  </p>
                  <p className="text-sm text-gray-600">{order.departamento}</p>
                  <p className="text-sm text-gray-600">
                    {order.telefonoContacto}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <h3 className="font-medium">Método de Envío</h3>
                  <p className="text-sm text-gray-600">
                    Contraentrega gratuita en toda Colombia
                  </p>
                  <p className="mt-1 text-sm font-medium text-green-600">
                    Envío Gratis
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="mb-4 font-medium">Productos</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                    <img
                      src={
                        item.variacion.producto.imagenPrincipal ||
                        "/placeholder.svg"
                      }
                      alt={item.variacion.producto.nombre}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <h4 className="font-medium">
                        {item.variacion.producto.nombre}
                      </h4>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-gray-500">
                      <p>Cantidad: {item.cantidad}</p>
                      {item.variacion.atributos.map((attr, index) => (
                        <p key={index}>
                          {attr.valorAtributo.atributo.nombre}:{" "}
                          {attr.valorAtributo.valor}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal</p>
                <p className="line-through text-gray-500">
                  ${subtotalNoPromo.toLocaleString("CO")}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Descuento</p>
                <p className="text-green-600">
                  ${totalNeto.toLocaleString("CO")}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Envío</p>
                <p className="text-green-600">Gratis</p>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <p>Total</p>
                <p className="text-green-600">
                  ${totalNeto.toLocaleString("CO")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8 rounded-lg border bg-amber-50 p-4 text-amber-800">
          <div className="flex items-start gap-3">
            <Package className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <h3 className="font-medium">¿Qué sigue?</h3>
              <p className="mt-1 text-sm">
                Recibirás un correo electrónico de confirmación con los detalles
                de tu pedido. Te contactaremos pronto para coordinar la entrega.
                Recuerda que el pago se realizará contra entrega.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/productos">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Seguir comprando
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
