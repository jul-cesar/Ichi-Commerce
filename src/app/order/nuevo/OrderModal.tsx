"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  CreditCard,
  Loader2,
  MapPin,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";

import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import colombia from "../../../utils/colombia.json";
import {
  createOrder,
  createOrderWithoutLogin,
  sendOrderToWhatsapp,
} from "../actions";

type SelectedProduct = {
  productId: string;
  nombre: string;
  quantity: number;
  attributes: { [key: string]: string };
  price: number;
  priceDosificacion: number | null;
  variacionId: string;
  variaciones: {
    id: string;
    stock: number;
    atributos: {
      valorAtributo: {
        atributo: { nombre: string };
        valor: string;
      };
    }[];
  }[];
};

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

interface CheckoutModalProps {
  promoPercent?: number;
  isOpen: boolean;
  onClose: () => void;
  products: SelectedProduct[];
}

const CheckoutModal = ({
  isOpen,
  onClose,
  products,
  promoPercent,
}: CheckoutModalProps) => {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [availableAttributes, setAvailableAttributes] = useState<{
    [key: string]: string[];
  }>({});
  const [allAttributes, setAllAttributes] = useState<{
    [key: string]: string[];
  }>({});
  const [cities, setCities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (products && products.length > 0) {
      setSelectedProducts(products);
      setIsAnimating(true);

      // Desactivar la animación después de un tiempo
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [products]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: session?.user?.name || "",
      apellidos: "",
      email: session?.user?.email || "",
      telefono: "",
      departamento: "",
      ciudad: "",
      direccion: "",
      nombreBarrio: "",
    },
  });

  const handleDepartmentChange = (value: string) => {
    form.setValue("departamento", value);
    form.setValue("ciudad", "");

    const departmentData = colombia.find((item) => item.departamento === value);

    if (departmentData) {
      setCities(departmentData.ciudades);
    } else {
      setCities([]);
    }
  };

  const sanitizeText = (text: string): string => {
    return text
      .replace(/\n|\t/g, " ") // Replace new-line and tab characters with a single space
      .replace(/ {2,}/g, " "); // Replace multiple consecutive spaces with a single space
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    const orderPayload = {
      direccionEnvio: data.direccion,
      nombreBarrio: data.nombreBarrio,
      telefonoContacto: data.telefono,
      apellidos: data.apellidos,
      nombre: data.nombre,
      departamento: data.departamento,
      ciudad: data.ciudad,
      items: selectedProducts.map((product) => ({
        variacionId: product.variacionId,
        cantidad: product.quantity,
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

    const whatsappResponse = await sendOrderToWhatsapp({
      nombre: sanitizeText(data.nombre),
      telefono: sanitizeText(data.telefono),
      direccion: sanitizeText(data.direccion),
      fecha: sanitizeText(
        new Intl.DateTimeFormat("es-CO", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(newOrder.order?.createdAt)
      ),
      barrio: sanitizeText(data.nombreBarrio),
      items: selectedProducts.map((product) => ({
        nombreProducto: sanitizeText(product.nombre),
        cantidad: product.quantity,
        precio:
          product.quantity === 2 && product.priceDosificacion
            ? product.priceDosificacion
            : product.quantity * product.price,
      })),
      total: selectedProducts.reduce(
        (total, product) =>
          total +
          (product.quantity === 2 && product.priceDosificacion
            ? product.priceDosificacion
            : product.quantity * product.price),
        0
      ),
    });

    if (!whatsappResponse.success) {
      toast.error("Error al enviar la orden a WhatsApp.");
    } else {
      toast.success("¡Orden enviada a WhatsApp con éxito!");
    }

    toast.success("¡Orden creada con éxito!");
    onClose();
    router.push(`/order/success?order=${newOrder.order?.id}`);

    setIsSubmitting(false);
    form.reset();
    setCities([]);
  };

  const handleCloseAttempt = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmationModal(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmationModal(false);
  };

  // Calcular el total de la orden
  const orderTotal = selectedProducts.reduce(
    (total, product) =>
      total +
      (product.quantity === 2 && product.priceDosificacion
        ? product.priceDosificacion
        : product.quantity * product.price),
    0
  );

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseAttempt();
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-lg">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-green-500 flex justify-between items-center p-4 border-b text-white rounded-t-lg">
            <DialogTitle className="text-2xl font-bold">
              Finalizar Compra
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseAttempt}
              className="text-white hover:bg-green-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="bg-white px-4 py-3 border-b">
            <div className="flex items-center justify-center max-w-3xl mx-auto">
              <div className="flex items-center w-full">
                <div
                  className={`flex flex-col items-center ${
                    activeStep >= 1 ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                      activeStep >= 1
                        ? "border-green-600 bg-green-50"
                        : "border-gray-300"
                    }`}
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">
                    Productos
                  </span>
                </div>
                <div
                  className={`flex-1 h-1 mx-2 ${
                    activeStep >= 2 ? "bg-green-600" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`flex flex-col items-center ${
                    activeStep >= 2 ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                      activeStep >= 2
                        ? "border-green-600 bg-green-50"
                        : "border-gray-300"
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">
                    Dirección
                  </span>
                </div>
                <div
                  className={`flex-1 h-1 mx-2 ${
                    activeStep >= 3 ? "bg-green-600" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`flex flex-col items-center ${
                    activeStep >= 3 ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                      activeStep >= 3
                        ? "border-green-600 bg-green-50"
                        : "border-gray-300"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">
                    Confirmación
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <Card className="shadow-lg">
                  <CardHeader className="space-y-1 bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg border-b">
                    <CardTitle className="text-xl sm:text-2xl text-green-800 font-bold flex items-center gap-2">
                      <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
                      Información de orden
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      Complete los datos para procesar su orden de forma segura
                    </CardDescription>
                  </CardHeader>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                      <CardContent className="space-y-6 pt-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium flex items-center gap-2 text-gray-800">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 text-sm">
                              1
                            </span>
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
                                    <Input
                                      placeholder="Juan Pepe"
                                      {...field}
                                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    />
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
                                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
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
                                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
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
                                    <Input
                                      placeholder="3001234567"
                                      {...field}
                                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium flex items-center gap-2 text-gray-800">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 text-sm">
                              2
                            </span>
                            Dirección de Envío
                          </h3>
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
                                      <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
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
                                      <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
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
                                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
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
                                <FormItem className="col-span-1 md:col-span-2">
                                  <FormLabel>Barrio o referencia</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Nombre del barrio o referencias"
                                      {...field}
                                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center gap-3">
                          <Truck className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <p className="text-sm text-green-800">
                            <span className="font-semibold">Envío GRATIS</span>{" "}
                            a toda Colombia. Entrega estimada: 3-5 días hábiles.
                          </p>
                        </div>

                        <Separator />
                      </CardContent>

                      <CardFooter className="flex justify-between border-t p-4 sm:p-6 bg-gray-50">
                        <Button
                          type="submit"
                          disabled={
                            isSubmitting || selectedProducts.length === 0
                          }
                          className="min-w-[150px] bg-green-600 hover:bg-green-700 text-white"
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

              <div className="lg:col-span-1">
                <Card className="shadow-lg h-fit sticky top-4">
                  <CardHeader className="space-y-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-lg border-b">
                    <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 text-gray-800">
                      <ShoppingBag className="h-5 w-5" />
                      Resumen de la Orden
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {selectedProducts.length}{" "}
                      {selectedProducts.length === 1 ? "producto" : "productos"}{" "}
                      en tu orden
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {selectedProducts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No hay productos seleccionados
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
                      <div className="space-y-4">
                        {selectedProducts.map((product, index) => (
                          <div
                            key={index}
                            className={`flex flex-col gap-3 border-b pb-4 hover:bg-gray-50 p-2 rounded-md transition-all ${
                              isAnimating ? "animate-fadeIn" : ""
                            }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {product.nombre}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Cantidad: {product.quantity}
                                </p>
                              </div>
                              <p className="text-sm font-bold text-green-700">
                                ${product.price.toLocaleString("es-CO")}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700">
                                Atributos seleccionados
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(product.attributes).map(
                                  ([key, value]) => (
                                    <div
                                      key={key}
                                      className="flex flex-col bg-gray-50 p-2 rounded-md"
                                    >
                                      <label className="text-xs font-medium text-gray-500">
                                        {key}
                                      </label>
                                      <p className="text-sm text-gray-800">
                                        {value}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        <Separator className="my-4" />

                        <div className="space-y-2 bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-800">
                              ${orderTotal.toLocaleString("es-CO")}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Envío</span>
                            <span className="text-green-600 font-medium">
                              GRATIS
                            </span>
                          </div>

                          <Separator className="my-2" />

                          <div className="flex justify-between font-bold">
                            <span className="text-gray-800">Total</span>
                            <span className="text-green-700 text-lg">
                              ${orderTotal.toLocaleString("es-CO")}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 bg-amber-50 p-3 rounded-md border border-amber-200">
                          <p className="text-sm text-amber-800 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-amber-600" />
                            <span className="font-medium">
                              Pago contraentrega
                            </span>
                          </p>
                          <p className="text-xs text-amber-700 mt-1 pl-6">
                            Pagas cuando recibas tu pedido en la puerta de tu
                            casa
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog
        open={showConfirmationModal}
        onOpenChange={setShowConfirmationModal}
      >
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-lg">
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-4 text-white">
            <DialogTitle className="text-xl font-bold">
              ¡No pierdas esta promoción!
            </DialogTitle>
            <DialogDescription className="text-base pt-2 text-white opacity-90">
              Si abandonas ahora, perderás el descuento especial en tu compra.
            </DialogDescription>
          </div>

          <div className="p-4 sm:p-6">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 my-2">
              <p className="font-medium text-amber-800 mb-2">
                Beneficios exclusivos:
              </p>
              <ul className="space-y-2 text-amber-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>
                    {Math.abs(promoPercent ?? 0)}% de descuento en tu primera
                    compra
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Envío gratis a nivel nacional</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Acceso a promociones exclusivas</span>
                </li>
              </ul>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handleConfirmClose}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Abandonar de todos modos
              </Button>
              <Button
                onClick={handleCancelClose}
                className="w-full sm:w-auto order-1 sm:order-2 bg-green-600 hover:bg-green-700"
              >
                ¡Continuar con mi compra!
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckoutModal;
