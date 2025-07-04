"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  CreditCard,
  CreditCardIcon,
  Loader2,
  MapPin,
  ShieldCheck,
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
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  promoPercent = 15,
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

  useEffect(() => {
    if (products && products.length > 0) {
      const attributesMap: { [key: string]: string[] } = {};
      const optionsMap: { [key: string]: string[] } = {};

      products?.forEach((product: SelectedProduct) => {
        product.attributes &&
          Object.entries(product.attributes)?.forEach(([key, value]) => {
            if (!attributesMap[key]) attributesMap[key] = [];
            if (!attributesMap[key].includes(value))
              attributesMap[key].push(value);

            if (!optionsMap[key]) optionsMap[key] = [];
            if (!optionsMap[key].includes(value)) optionsMap[key].push(value);
          });
      });

      setAllAttributes(optionsMap);
      setAvailableAttributes(optionsMap);
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

  const calculateTotalPrice = (products: SelectedProduct[]) => {
    if (!products || products.length === 0) return 0;

    const totalQuantity = products.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    // Si hay exactamente 2 productos en total, aplicar el priceDosificacion si existe
    if (totalQuantity === 2) {
      const productWithDosificacion = products.find(
        (product) => product.priceDosificacion !== null
      );
      if (productWithDosificacion?.priceDosificacion) {
        return productWithDosificacion.priceDosificacion;
      }
    }

    // De lo contrario, calcular el total normalmente
    return products.reduce(
      (total, product) => total + product.quantity * product.price,
      0
    );
  };

  const totalPrice = calculateTotalPrice(selectedProducts);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    const userAgent = navigator.userAgent;

    const ipRes = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipRes.json();
    const ip = ipData.ip;

    const res = await fetch("/api/facebook-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName: "Purchase",
        url: window.location.href,
        ip,
        userAgent,
        value: totalPrice,
        currency: "COP",
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Error en la API de Facebook");
    }

    const facebookResponse = await res.json();
    console.log("Facebook event response:", facebookResponse);
    try {
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
        return;
      }

      // Preparar detalles de productos para WhatsApp
      const whatsappItems = selectedProducts.map((product) => {
        const price = product.price;

        return sanitizeText(
          `${product.nombre} (${Object.entries(product.attributes)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ")}) x${
            product.quantity
          } - $${product.price?.toLocaleString("es-CO")}`
        );
      });

      const emailRes = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: `${sanitizeText(data.nombre)} ${sanitizeText(data.apellidos)}`,
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
          items: whatsappItems,
          total: totalPrice,
          ciudadDepartamento: `${sanitizeText(data.ciudad)}, ${sanitizeText(
            data.departamento
          )}`,
        }),
      });

      console.log("Respuesta del email:", emailRes.status, emailRes.statusText);

      if (!emailRes.ok) {
        const errorData = await emailRes.json();
        console.error("Error al enviar email:", errorData);
        throw new Error(
          `Error al enviar el correo: ${errorData.error || emailRes.statusText}`
        );
      }

      const emailData = await emailRes.json();
      console.log("Email enviado exitosamente:", emailData);

      const whatsappResponse = await sendOrderToWhatsapp({
        nombre: `${sanitizeText(data.nombre)} ${sanitizeText(data.apellidos)}`,
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
        items: whatsappItems,
        total: totalPrice,
        ciudadDepartamento: `${sanitizeText(data.ciudad)}, ${sanitizeText(
          data.departamento
        )}`,
      });

      if (!whatsappResponse.success) {
        toast.error("Error al enviar la orden a WhatsApp.");
      } else {
        toast.success("¡Orden enviada a WhatsApp con éxito!");
      }

      toast.success("¡Orden creada con éxito!");
      onClose();
      router.push(`/order/success?order=${newOrder.order?.id}`);
    } catch (error) {
      console.error("Error al procesar la orden:", error);
      toast.error(
        "Ocurrió un error al procesar su orden. Por favor intente nuevamente."
      );
    } finally {
      setIsSubmitting(false);
      form.reset();
      setCities([]);
    }
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

  const handleSecondProductSelection = (attribute: string, value: string) => {
    setAvailableAttributes((prev) => ({
      ...prev,
      [attribute]: [value], // Ensure the value is wrapped in an array
    }));
  };

  const addSecondProductToOrder = () => {
    if (selectedProducts.length === 1) {
      const firstProduct = selectedProducts[0];

      // Find a matching variation based on selected attributes
      const matchingVariation = firstProduct.variaciones.find((variacion) =>
        Object.entries(availableAttributes).every(([key, value]) =>
          variacion.atributos.some(
            (atributo) =>
              atributo.valorAtributo.atributo.nombre === key &&
              atributo.valorAtributo.valor === value[0] // Access the first value in the array
          )
        )
      );

      if (!matchingVariation) {
        toast.error(
          "No se encontró una variación con los atributos seleccionados."
        );
        return;
      }

      const secondProduct: SelectedProduct = {
        ...firstProduct,
        quantity: 1,
        variacionId: matchingVariation.id, // Use the matching variation ID
        attributes: Object.fromEntries(
          Object.entries(availableAttributes).map(([key, value]) => [
            key,
            value[0],
          ])
        ), // Convert arrays to strings for attributes
      };

      setSelectedProducts((prev) => [...prev, secondProduct]);
    }
  };

  // Render attribute options for the second product
  const renderAttributeOptions = () => {
    if (selectedProducts.length === 0) return null;

    const firstProduct = selectedProducts[0];

    const allAttributesMap: { [key: string]: string[] } = {};
    firstProduct.variaciones.forEach((variacion) => {
      variacion.atributos.forEach((atributo) => {
        const attributeName = atributo.valorAtributo.atributo.nombre;
        const attributeValue = atributo.valorAtributo.valor;

        if (!allAttributesMap[attributeName]) {
          allAttributesMap[attributeName] = [];
        }

        if (!allAttributesMap[attributeName].includes(attributeValue)) {
          allAttributesMap[attributeName].push(attributeValue);
        }
      });
    });

    return Object.keys(allAttributesMap).map((attribute) => (
      <div key={attribute} className="flex flex-col">
        <label className="text-xs font-medium">{attribute}</label>
        <div className="flex flex-wrap gap-2">
          {allAttributesMap[attribute]
            .slice()
            .sort((a, b) => a.localeCompare(b))
            .map((option) => (
              <button
                key={option}
                onClick={() => handleSecondProductSelection(attribute, option)}
                className={cn(
                  "px-3 py-1.5 rounded-md border transition-all",
                  availableAttributes[attribute]?.[0] === option // Compare the first value in the array
                    ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                )}
              >
                {option}
              </button>
            ))}
        </div>
      </div>
    ));
  };

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
        <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-lg">
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

          <div className="p-4 sm:p-6 space-y-6">
            {/* Resumen de la Orden - Ahora arriba */}
            <Card className="shadow-lg">
              <CardHeader className="space-y-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-lg border-b">
                <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 text-gray-800">
                  <ShoppingBag className="h-5 w-5" />
                  Resumen de la Orden
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {selectedProducts.length}{" "}
                  {selectedProducts.length === 1 ? "producto" : "productos"} en
                  tu orden
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
                    <div className="grid grid-cols-1 gap-3">
                      {selectedProducts.map((product, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center border rounded-md p-3 hover:bg-gray-50 transition-all",
                            isAnimating && "animate-in fade-in-50 duration-300"
                          )}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {product.nombre}
                              </p>
                              <p className="text-sm font-bold text-green-700 ml-2">
                                ${product.price?.toLocaleString("es-CO")}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Cantidad: {product.quantity}
                            </p>

                            <div className="flex flex-wrap gap-1">
                              {Object.entries(product.attributes).map(
                                ([key, value]) => (
                                  <span
                                    key={key}
                                    className="inline-flex text-xs bg-gray-100 px-2 py-1 rounded"
                                  >
                                    <span className="font-medium text-gray-600">
                                      {key}:
                                    </span>
                                    <span className="ml-1 text-gray-800">
                                      {value}
                                    </span>
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="bg-gray-50 p-4 rounded-md max-w-md mx-auto">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="text-gray-800">
                            ${totalPrice.toLocaleString("es-CO")}
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
                            ${totalPrice.toLocaleString("es-CO")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Promo Section: Llévate 2 pares */}
            {selectedProducts.length === 1 && (
              <div className="bg-red-50 p-4 rounded-md border border-red-200">
                <h3 className="text-lg font-bold text-red-600 mb-2">
                  ¡Llévate 2 pares!
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Aprovecha esta promoción especial y elige otro producto para
                  activar el descuento.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {renderAttributeOptions()}
                </div>
                <Button
                  onClick={addSecondProductToOrder}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                >
                  Agregar segundo producto
                </Button>
              </div>
            )}

            {/* Información Personal */}
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
                                    <SelectValue placeholder="Selec Departamento" />
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
                                    <SelectValue placeholder="Selec Ciudad" />
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
                        <span className="font-semibold">Envío GRATIS</span> a
                        toda Colombia. Entrega estimada: 3-5 días hábiles.
                      </p>
                    </div>

                    {/* Métodos de pago */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center gap-2 text-gray-800">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 text-sm">
                          3
                        </span>
                        Método de Pago
                      </h3>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center p-3 border border-green-200 rounded-lg bg-green-50">
                          <div className="flex items-center h-5">
                            <input
                              id="pago-contraentrega"
                              name="metodo-pago"
                              type="radio"
                              defaultChecked
                              className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                            />
                          </div>
                          <div className="ml-3 flex items-center gap-2">
                            <CreditCardIcon className="h-5 w-5 text-green-600" />
                            <label
                              htmlFor="pago-contraentrega"
                              className="font-medium text-gray-800"
                            >
                              Pago contraentrega
                            </label>
                            <span className="ml-1 text-sm text-gray-500">
                              (Pagas cuando recibas tu pedido)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />
                  </CardContent>

                  <CardFooter className="flex justify-between border-t p-4 sm:p-6 bg-gray-50">
                    <Button
                      type="submit"
                      disabled={isSubmitting || selectedProducts.length === 0}
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

            {/* Garantías y seguridad */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center text-center">
                <ShieldCheck className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium text-gray-800">Compra Segura</h3>
                <p className="text-sm text-gray-600">
                  Tus datos están protegidos
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center text-center">
                <Truck className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium text-gray-800">Envío Gratis</h3>
                <p className="text-sm text-gray-600">A toda Colombia</p>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center text-center">
                <CreditCardIcon className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium text-gray-800">
                  Pago Contraentrega
                </h3>
                <p className="text-sm text-gray-600">
                  Paga al recibir tu pedido
                </p>
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
        <DialogContent className="w-[95vw] max-w-md p-0 overflow-hidden rounded-lg">
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
                  <span>{promoPercent}% de descuento en tu primera compra</span>
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
