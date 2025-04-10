"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Prisma } from "@prisma/client";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { editAttributeOption } from "./admin/actions";

// Define the form schema
const attributeValueFormSchema = z.object({
  valor: z.string().min(1, "El valor no puede estar vacío"),
});

type AttributeValueFormValues = z.infer<typeof attributeValueFormSchema>;

type AttributeValue = {
  id: string;
  valor: string;
  atributoId: string;
  atributoNombre: string;
};

interface EditAttributeValueModalProps {
  value: Prisma.OpcionAtributoGetPayload<{}>;
}

export function EditAttributeValueModal({
  value,
}: EditAttributeValueModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [attributeName, setAttributeName] = useState("");
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const form = useForm<AttributeValueFormValues>({
    resolver: zodResolver(attributeValueFormSchema),
    defaultValues: {
      valor: value.valor,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  // Fetch attribute value data when the modal opens and valueId changes

  async function onSubmit(data: AttributeValueFormValues) {
    if (!value) return;
    const edit = await editAttributeOption(value.id, data.valor);
    if (edit.error) {
      toast.error("Error al actualizar el valor del atributo");
    }
    toast.success("Valor del atributo actualizado correctamente");
    try {
      toast("El valor del atributo ha sido actualizado exitosamente.");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast("Ocurrió un error al actualizar el valor del atributo.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Valor de Atributo</DialogTitle>
          <DialogDescription>
            Modifica el valor seleccionado del atributo{" "}
            {attributeName ? `"${attributeName}"` : ""}.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-2"
            >
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Rojo, Grande, Algodón"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  Guardar cambios
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
