"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { crearCategoria } from "@/components/admin/actions";
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
import { DialogTrigger } from "@radix-ui/react-dialog";
import { toast } from "sonner";

// Define the form schema
const categorieFormSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  descripcion: z.string().optional(),
});

type AttributeFormValues = z.infer<typeof categorieFormSchema>;

// This would be replaced with your actual API calls

export async function addCategorie(data: AttributeFormValues) {
  // Example implementation - replace with your actual API call
  const response = await crearCategoria({
    nombre: data.nombre,
    descripcion: data.descripcion ?? "",
  });

  if (!response) {
    toast.error("Error al agregar la categoria");
  }
  toast.success("Categoria agregada correctamente");
}

export function AddCategorieModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<AttributeFormValues>({
    resolver: zodResolver(categorieFormSchema),
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: AttributeFormValues) {
    try {
      await addCategorie(data);
      toast("La categoria ha sido agregada exitosamente.");
      setOpen(false);

      router.refresh();
    } catch (error) {
      toast("Ocurrió un error al agregar la categoria.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Agregar categoria
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar categoria</DialogTitle>
          <DialogDescription>
            Ingresa la informacion de la nueva categoria para tus productos
          </DialogDescription>
        </DialogHeader>
        {isSubmitting ? (
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
                      <Input placeholder="Ej: Zapatos, Camisas" {...field} />
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
                        placeholder="Descripción de la categoria"
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
                  Agregar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
