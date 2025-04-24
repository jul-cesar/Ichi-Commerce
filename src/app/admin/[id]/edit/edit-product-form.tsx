"use client";

import type React from "react";

import { editarProducto } from "@/components/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type EditProductFormProps = {
  product: Prisma.ProductoGetPayload<{
    include: {
      categoria: true;
    };
  }>;
  categories: Prisma.CategoriaGetPayload<{}>[];
};

export function EditProductForm({ product, categories }: EditProductFormProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: product.nombre,
    descripcion: product.descripcion,
    precio: product.precio,
    categoriaId: product.categoriaId,

    precioPromo: product.precioPromo,
    precioDosificacion: product.precioDosificacion,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : Number(value),
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, activo: checked }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoriaId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // API call to update product
      await editarProducto(product.id, {
        ...formData,
        precio: Number(formData.precio),
        precioDosificacion: Number(formData.precioDosificacion),
        precioPromo: Number(formData.precioPromo),
      });

      toast("Producto actualizado");

      // Redirect back to products page
      router.push("/productos");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast("Error al guardar los cambios. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Información del producto</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion ?? ""}
              onChange={handleChange}
              rows={3}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio</Label>
              <Input
                id="precio"
                name="precio"
                type="number"
                min="0"
                step="1"
                value={formData.precio}
                onChange={handleNumberChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precioPromo">Precio promocional</Label>
              <Input
                id="precioPromo"
                name="precioPromo"
                type="number"
                min="0"
                step="1"
                value={formData.precioPromo}
                onChange={handleNumberChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="precioDosificacion">Precio dosificación</Label>
              <Input
                id="precioDosificacion"
                name="precioDosificacion"
                type="number"
                min="0"
                step="1"
                value={formData.precioDosificacion ?? ""}
                onChange={handleNumberChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                value={formData.categoriaId}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
