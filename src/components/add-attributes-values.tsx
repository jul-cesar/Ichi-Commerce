"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Define the form schema
const attributeValuesFormSchema = z.object({
  atributoId: z.string({
    required_error: "Selecciona un atributo",
  }),
  valores: z
    .array(
      z.object({
        valor: z.string().min(1, "El valor no puede estar vacío"),
      })
    )
    .min(1, "Agrega al menos un valor"),
});

type AttributeValuesFormValues = z.infer<typeof attributeValuesFormSchema>;

type Attribute = {
  id: string;
  nombre: string;
};

// This would be replaced with your actual API calls
async function fetchAttributes(): Promise<Attribute[]> {
  // Example implementation - replace with your actual API call
  const response = await fetch("/api/atributos");
  if (!response.ok) {
    throw new Error("Error al obtener los atributos");
  }
  return response.json();
}

async function createAttributeValues(data: AttributeValuesFormValues) {
  // Example implementation - replace with your actual API call
  const response = await fetch(`/api/atributos/${data.atributoId}/valores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ valores: data.valores.map((v) => v.valor) }),
  });

  if (!response.ok) {
    throw new Error("Error al crear los valores del atributo");
  }

  return response.json();
}

export function AddAttributeValuesModal() {
  const [open, setOpen] = useState(false);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const form = useForm<AttributeValuesFormValues>({
    resolver: zodResolver(attributeValuesFormSchema),
    defaultValues: {
      atributoId: "",
      valores: [{ valor: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "valores",
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      fetchAttributes()
        .then((data) => {
          setAttributes(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching attributes:", error);
          toast("No se pudieron cargar los atributos.");
          setIsLoading(false);
        });
    }
  }, [open, toast]);

  async function onSubmit(data: AttributeValuesFormValues) {
    try {
      await createAttributeValues(data);
      toast("Los valores han sido agregados exitosamente al atributo.");
      form.reset({
        atributoId: "",
        valores: [{ valor: "" }],
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast("Ocurrió un error al agregar los valores.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Agregar Valores a Atributo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Valores a Atributo</DialogTitle>
          <DialogDescription>
            Agrega valores a un atributo existente. Por ejemplo, para el
            atributo "Color" podrías agregar valores como "Rojo", "Azul",
            "Verde".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="atributoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atributo</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un atributo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {attributes.map((attribute) => (
                        <SelectItem key={attribute.id} value={attribute.id}>
                          {attribute.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Valores</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ valor: "" })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar valor
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`valores.${index}.valor`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder={`Valor ${index + 1}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              {form.formState.errors.valores?.root && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.valores.root.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
