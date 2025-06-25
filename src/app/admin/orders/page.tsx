export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  Users,
} from "lucide-react";
import { prisma } from "../../../../db/instance";

const page = async () => {
  const orders = await prisma.order.findMany({
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
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calcular estadísticas
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => {
    const totalItems = order.items.reduce(
      (itemSum, item) => itemSum + item.cantidad,
      0
    );
    const hasPromo = totalItems >= 2;

    if (hasPromo) {
      const productWithPromo = order.items.find(
        (item) => item.variacion.producto.precioDosificacion
      );
      if (productWithPromo) {
        return sum + productWithPromo.variacion.producto.precioDosificacion!;
      }
    }
    return sum + order.montoTotal;
  }, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.fechaCompra);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  }).length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "enviado":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "entregado":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatOrder = (order: any) => {
    const fechaFormateada = new Date(order.fechaCompra).toLocaleDateString(
      "es-ES",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Bogota",
      }
    );

    const totalItems = order.items.reduce(
      (sum: number, item: any) => sum + item.cantidad,
      0
    );
    const hasPromo = totalItems >= 2;

    let finalTotal = order.montoTotal;
    let promoApplied = false;

    if (hasPromo) {
      const productWithPromo = order.items.find(
        (item: any) => item.variacion.producto.precioDosificacion
      );
      if (productWithPromo) {
        finalTotal = productWithPromo.variacion.producto.precioDosificacion;
        promoApplied = true;
      }
    }

    return (
      <Card key={order.id} className="mb-6 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {order.nombre} {order.apellidos}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {order.telefonoContacto}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {fechaFormateada}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Productos */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              Productos solicitados
            </h4>
            <div className="space-y-2">
              {order.items.map((item: any) => {
                const atributos = item.variacion.atributos
                  .map((attr: any) => {
                    return `${attr.valorAtributo.atributo.nombre}: ${attr.valorAtributo.valor}`;
                  })
                  .join(", ");

                const precio = item.variacion.producto.precio * item.cantidad;

                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {item.variacion.producto.nombre}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {atributos} • Cantidad: {item.cantidad}
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(precio)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Dirección */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600" />
              Dirección de entrega
            </h4>
            <div className="bg-blue-50 p-3 rounded-lg space-y-1">
              <p>{order.direccionEnvio}</p>
              {order.nombreBarrio && (
                <p className="text-sm">Barrio: {order.nombreBarrio}</p>
              )}
              <p className="text-sm font-medium">
                {order.ciudad}, {order.departamento}
              </p>
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <span className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Total del pedido:
            </span>
            <div className="text-right">
              <p className="text-xl font-bold text-green-700">
                {formatPrice(finalTotal)}
              </p>
              {promoApplied && (
                <Badge className="bg-green-100 text-green-800 border-green-200 mt-1">
                  ¡Promo aplicada!
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className=" container px-4 py-6 mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-blue-600" />
          Panel de Órdenes
        </h1>
        <p className="text-muted-foreground">
          Gestiona y monitorea todas las órdenes de compra
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Todas las órdenes registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Suma de todas las órdenes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              Órdenes recibidas hoy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de órdenes */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            Órdenes Recientes ({orders.length})
          </h2>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                No hay órdenes disponibles
              </p>
              <p className="text-sm text-muted-foreground">
                Las nuevas órdenes aparecerán aquí
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>{orders.map(formatOrder)}</div>
        )}
      </div>
    </div>
  );
};

export default page;
