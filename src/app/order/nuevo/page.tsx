"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { CreditCard, Loader2, ShoppingBag } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
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
  priceDosificacion?: number;
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

const Page = () => {
  const searchParams = useSearchParams();
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
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    const products = searchParams.get("products");
    if (products) {
      const parsedProducts = JSON.parse(products);
      setSelectedProducts(parsedProducts);

      console.log(parsedProducts);

      const attributesMap: { [key: string]: string[] } = {};
      const optionsMap: { [key: string]: string[] } = {};

      parsedProducts?.forEach((product: SelectedProduct) => {
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
  }, [searchParams]);

  const handleAttributeChange = (
    productId: string,
    attribute: string,
    value: string
  ) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.productId === productId
          ? {
              ...product,
              attributes: {
                ...product.attributes,
                [attribute]: value,
              },
            }
          : product
      )
    );
  };

  const getAvailableOptions = (
    product: SelectedProduct,
    attribute: string,
    currentSelections: { [key: string]: string }
  ): string[] => {
    const otherSelections = { ...currentSelections };
    delete otherSelections[attribute];

    const validVariations = product.variaciones.filter((variation) =>
      Object.entries(otherSelections).every(([key, value]) =>
        variation.atributos.some(
          (attr) =>
            attr.valorAtributo.atributo.nombre === key &&
            attr.valorAtributo.valor === value
        )
      )
    );

    const options = new Set<string>();
    validVariations.forEach((variation) => {
      variation.atributos.forEach((attr) => {
        if (attr.valorAtributo.atributo.nombre === attribute) {
          options.add(attr.valorAtributo.valor);
        }
      });
    });

    return Array.from(options);
  };

  const handleAttributeSelection = (
    productId: string,
    attribute: string,
    value: string
  ) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.productId === productId
          ? {
              ...product,
              attributes: {
                ...product.attributes,
                [attribute]:
                  product.attributes[attribute] === value ? "" : value,
              },
            }
          : product
      )
    );
  };

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
  const router = useRouter();

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
    router.push(`/order/success?order=${newOrder.order?.id}`);

    setIsSubmitting(false);
    form.reset();
    setCities([]);
  };

  const memoizedAttributes = useMemo(
    () =>
      selectedProducts.map((product) => ({
        attributes: product.attributes,
        variaciones: product.variaciones,
      })),
    [selectedProducts]
  );

  return (
    <div className="min-h-screen py-10 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Finalizar Compra
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
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
                  </CardContent>

                  <CardFooter className="flex justify-between border-t p-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting || selectedProducts.length === 0}
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

          <div className="md:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="space-y-1 bg-muted rounded-t-lg">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Resumen de la Orden
                </CardTitle>
                <CardDescription>
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
                    {selectedProducts.map((product, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-3 border-b pb-4"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">
                              {product.nombre}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Cantidad: {product.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-bold">
                            ${product.price.toLocaleString("es-CO")}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Atributos seleccionados
                          </p>
                          {product.variaciones?.length > 0 &&
                            product.variaciones[0].atributos &&
                            Object.keys(
                              product.variaciones[0].atributos.reduce(
                                (acc, attr) => ({
                                  ...acc,
                                  [attr.valorAtributo.atributo.nombre]: true,
                                }),
                                {}
                              )
                            ).map((attribute) => {
                              const availableOptions = getAvailableOptions(
                                product,
                                attribute,
                                product.attributes
                              );

                              return (
                                <div key={attribute} className="flex flex-col">
                                  <label className="text-xs font-medium">
                                    {attribute}
                                  </label>
                                  <div className="flex flex-wrap gap-2">
                                    {availableOptions.map((option) => {
                                      const isSelected =
                                        product.attributes[attribute] ===
                                        option;

                                      return (
                                        <button
                                          key={option}
                                          onClick={() =>
                                            handleAttributeSelection(
                                              product.productId,
                                              attribute,
                                              option
                                            )
                                          }
                                          className={cn(
                                            "px-3 py-1.5 rounded-md border transition-all",
                                            isSelected
                                              ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                                              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                          )}
                                        >
                                          {option}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ))}

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>
                          $
                          {selectedProducts
                            .reduce((total, product) => {
                              if (
                                selectedProducts.length === 2 ||
                                (selectedProducts.length === 1 &&
                                  product.quantity === 2)
                              ) {
                                return product.priceDosificacion ?? total;
                              }
                              return total + product.quantity * product.price;
                            }, 0)
                            .toLocaleString("es-CO")}
                        </span>
                      </div>

                      <Separator className="my-2" />

                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>
                          $
                          {selectedProducts
                            .reduce((total, product) => {
                              if (
                                selectedProducts.length === 2 ||
                                (selectedProducts.length === 1 &&
                                  product.quantity === 2)
                              ) {
                                return product.priceDosificacion ?? total;
                              }
                              return total + product.quantity * product.price;
                            }, 0)
                            .toLocaleString("es-CO")}
                        </span>
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
