"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { editCategorie } from "@/components/admin/actions";
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

// Define the form schema
const categorieFormSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  descripcion: z.string().optional(),
});

type AttributeFormValues = z.infer<typeof categorieFormSchema>;

type EditCategorieModalProps = {
  categorie: Prisma.CategoriaGetPayload<{}>;
};

export function EditCategorieModal({ categorie }: EditCategorieModalProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<AttributeFormValues>({
    resolver: zodResolver(categorieFormSchema),
    defaultValues: {
      descripcion: categorie.descripcion ?? "",
      nombre: categorie.nombre,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: AttributeFormValues) {
    try {
      await editCategorie(categorie.id, {
        nombre: data.nombre,
        descripcion: data.descripcion ?? "",
      });
      toast.success("La categoría ha sido editada correctamente.");
      setOpen(false);

      router.refresh();
    } catch (error) {
      toast.error("Ocurrió un error al editar la categoría.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Editar categoría</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar categoría</DialogTitle>
          <DialogDescription>
            Edita la información de la categoría.
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
                        placeholder="Descripción de la categoría"
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
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
