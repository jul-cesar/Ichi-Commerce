"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Loader2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  getCartItems,
  removeFromCart,
  updateCartItemQuantity,
} from "@/app/productos/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/client";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import colombia from "../../../utils/colombia.json";
import { createOrder, createOrderWithoutLogin } from "../actions";

// Esquema de validación con Zod
const formSchema = z.object({
  nombre: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  apellidos: z
    .string()
    .min(3, { message: "El apellido debe tener al menos 3 caracteres" }),

  email: z.string().email({ message: "Correo electrónico inválido" }),
  telefono: z.string().min(9, { message: "Número de teléfono inválido" }),
  departamento: z.string().min(1, { message: "Seleccione un departamento" }),
  ciudad: z.string().min(1, { message: "Seleccione una ciudad" }),
  direccion: z
    .string()
    .min(5, { message: "La dirección debe tener al menos 5 caracteres" }),
  nombreBarrio: z.string().min(3, {
    message: "Es obligatorio un barrio o referencia",
  }),
});

type FormValues = z.infer<typeof formSchema>;

function CartItem({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: any;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
}) {
  const attributeTexts =
    item.variacion?.atributos
      .map(
        (attr: any) =>
          `${attr.valorAtributo.atributo.nombre}: ${attr.valorAtributo.valor}`
      )
      .join(", ") || "";

  return (
    <div className="flex gap-3 py-3">
      <div className="h-20 w-20 overflow-hidden rounded-md bg-muted">
        <Image
          src={item.variacion.producto.imagenPrincipal || "/placeholder.svg"}
          alt={item.variacion.producto.nombre}
          width={80}
          height={80}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex justify-between">
          <span className="line-clamp-1 text-sm font-medium">
            {item.variacion.producto.nombre}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {attributeTexts && (
          <p className="text-xs text-muted-foreground">{attributeTexts}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-r-none"
              onClick={() => onQuantityChange(item.id, item.cantidad - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="flex h-6 w-8 items-center justify-center border-y text-xs">
              {item.cantidad}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-l-none"
              onClick={() => onQuantityChange(item.id, item.cantidad + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm font-medium">
            $
            {(item.variacion.producto.precio * item.cantidad).toLocaleString(
              "es-CO"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

const Page = () => {
  const [cities, setCities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  // Obtener items del carrito
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cartItems", session?.user?.id],
    queryFn: () => getCartItems(session?.user?.id),
    refetchOnWindowFocus: true,
  });

  // Calcular totales
  const totalItems = cartItems.reduce(
    (total, item) => total + item.cantidad,
    0
  );
  const subtotal = cartItems.reduce(
    (total, item) => total + item.cantidad * item.variacion.producto.precio,
    0
  );

  // Funciones para manejar el carrito
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const upd = await updateCartItemQuantity(itemId, newQuantity);
    if (upd.success) {
      toast.success("Cantidad actualizada");
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
    } else {
      toast.error("Error al actualizar la cantidad del producto");
    }
  };

  const handleRemove = async (itemId: string) => {
    const del = await removeFromCart(itemId);
    if (del.success) {
      toast.success("Producto eliminado del carrito");
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
    } else {
      toast.error("Error al eliminar el producto del carrito");
    }
  };

  // Inicializar React Hook Form con Zod
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: session?.user?.name,
      apellidos: "",
      email: session?.user.email,
      telefono: "",
      departamento: "",
      ciudad: "",
      direccion: "",
      nombreBarrio: "",
    },
  });

  // Manejar cambio de departamento
  const handleDepartmentChange = (value: string) => {
    form.setValue("departamento", value);
    form.setValue("ciudad", "");

    // Encontrar el departamento seleccionado y obtener sus ciudades
    const departmentData = colombia.find((item) => item.departamento === value);

    if (departmentData) {
      setCities(departmentData.ciudades);
    } else {
      setCities([]);
    }
  };
  const router = useRouter();

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    console.log("Datos del formulario:", data);
    console.log("Items del carrito:", cartItems);

    const orderPayload = {
      direccionEnvio: data.direccion,
      nombreBarrio: data.nombreBarrio,
      telefonoContacto: data.telefono,
      apellidos: data.apellidos,
      nombre: data.nombre,
      departamento: data.departamento,
      ciudad: data.ciudad,
      items: cartItems.map((item) => ({
        variacionId: item.variacion.id,
        cantidad: item.cantidad,
      })),
    };

    const newOrder = session?.user?.id
      ? await createOrder({ ...orderPayload, userId: session.user.id })
      : await createOrderWithoutLogin(orderPayload);

    if (!newOrder.success) {
      toast.error("Error al crear la orden. Intente nuevamente.");
      setIsSubmitting(false);
      return;
    }

    toast.success("¡Orden creada con éxito!");
    router.push(`/order/success?order=${newOrder.order?.id}`);

    setIsSubmitting(false);
    form.reset();
    setCities([]);
  };

  // Verificar si hay items en el carrito

  return (
    <div className="min-h-screen py-10 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Finalizar Compra
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Formulario de pago - 2/3 del ancho */}
          <div className="md:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="space-y-1  text-primary-foreground rounded-t-lg">
                <CardTitle className="text-2xl text-black font-bold flex items-center gap-2">
                  <CreditCard className="h-6 w-6" />
                  Información de orden
                </CardTitle>
                <CardDescription className=" text-black">
                  Complete los datos para procesar su orden de forma segura
                </CardDescription>
              </CardHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-6 pt-6">
                    {/* Información Personal */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Información Personal
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="nombre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombres</FormLabel>
                              <FormControl>
                                <Input placeholder="Juan Pepe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="apellidos"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Apellidos</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Pérez Gonzales"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correo Electrónico</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="ejemplo@correo.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="telefono"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Celular WhatsApp</FormLabel>
                              <FormControl>
                                <Input placeholder="3001234567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Dirección de Facturación */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Dirección</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="departamento"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Departamento</FormLabel>
                              <Select
                                onValueChange={handleDepartmentChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar Departamento" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    {colombia.map((item) => (
                                      <SelectItem
                                        key={item.id}
                                        value={item.departamento}
                                      >
                                        {item.departamento}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ciudad"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ciudad</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={cities.length === 0}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar Ciudad" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    {cities.map((city, index) => (
                                      <SelectItem key={index} value={city}>
                                        {city}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="direccion"
                          render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                              <FormLabel>
                                Dirección Completa (Conjunto, piso, apto)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Calle 123 # 45-67"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="nombreBarrio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Barrio o referencia</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Nombre del barrio o referencias"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Información de Pago */}
                  </CardContent>

                  <CardFooter className="flex justify-between border-t p-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting || cartItems.length === 0}
                      className="min-w-[150px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        "Realizar Orden"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>

          {/* Resumen del carrito - 1/3 del ancho */}
          <div className="md:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="space-y-1 bg-muted rounded-t-lg">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Resumen de la Orden
                </CardTitle>
                <CardDescription>
                  {totalItems} {totalItems === 1 ? "producto" : "productos"} en
                  tu carrito
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Tu carrito está vacío
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => (window.location.href = "/productos")}
                    >
                      Ver productos
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="max-h-[400px] overflow-y-auto pr-2">
                      {cartItems.map((item) => (
                        <CartItem
                          key={item.id}
                          item={item}
                          onQuantityChange={handleQuantityChange}
                          onRemove={handleRemove}
                        />
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>${subtotal.toLocaleString("es-CO")}</span>
                      </div>

                      <Separator className="my-2" />

                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${subtotal.toLocaleString("es-CO")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
