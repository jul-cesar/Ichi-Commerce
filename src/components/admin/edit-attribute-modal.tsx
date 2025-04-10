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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Prisma } from "@prisma/client";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { editAttribute } from "./actions";

// Define the form schema
const attributeFormSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  descripcion: z.string().optional(),
});

type AttributeFormValues = z.infer<typeof attributeFormSchema>;

type Attribute = Prisma.AtributoVariacionGetPayload<{
  include: {
    OpcionAtributo: true;
  };
}>;

// This would be replaced with your actual API calls

async function updateAttribute(id: string, data: AttributeFormValues) {
  // Example implementation - replace with your actual API call
  const response = await editAttribute(id, data);

  if (!response.error) {
    toast.error("Error al actualizar el atributo");
  }
}

interface EditAttributeModalProps {
  attribute: Attribute;
}

export function EditAttributeModal({ attribute }: EditAttributeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<AttributeFormValues>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: {
      nombre: attribute.nombre,
      descripcion: attribute.descripcion || "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: AttributeFormValues) {
    if (!attribute) return;

    try {
      await updateAttribute(attribute.id, data);
      toast("El atributo ha sido actualizado exitosamente.");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast("Ocurrió un error al actualizar el atributo.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Atributo</DialogTitle>
          <DialogDescription>
            Modifica la información del atributo seleccionado.
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
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Color, Tamaño, Material"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción del atributo"
                        className="resize-none"
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
