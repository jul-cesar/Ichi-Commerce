"use client";

import type React from "react";

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
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { editarProducto } from "./actions";

type EditProductModalProps = {
  product: {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    categoriaId: string;
    precioPromo: number;
    precioDosificacion: number;
    activo: boolean;
  };
  categories: Prisma.CategoriaGetPayload<{}>[] | undefined;
  trigger?: React.ReactNode;
};

export function EditProductModal({
  product,
  trigger,
  categories,
}: EditProductModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: product.nombre,
    descripcion: product.descripcion,
    precio: product.precio,
    categoriaId: product.categoriaId,
    activo: product.activo,
    precioPromo: product.precioPromo,
    precioDosificacion: product.precioDosificacion,
  });

  // Reset form data when product changes or modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: product.precio,
        categoriaId: product.categoriaId,
        activo: product.activo,
        precioPromo: product.precioPromo,
        precioDosificacion: product.precioDosificacion,
      });
    }
  }, [product, open]);

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

      // Close modal and refresh page
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar los cambios. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => !isSubmitting && setOpen(newOpen)}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Editar producto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
          <DialogDescription>
            Actualiza la información básica del producto. Haz clic en guardar
            cuando termines.
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-product-form"
          onSubmit={handleSubmit}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="z-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className="min-h-[80px] z-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="z-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precioPromo">Precio promo</Label>
              <Input
                id="precioPromo"
                name="precioPromo"
                type="number"
                min="0"
                step="1"
                value={formData.precioPromo}
                onChange={handleNumberChange}
                required
                className="z-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precioDosificacion">Precio dosificación</Label>
              <Input
                id="precioDosificacion"
                name="precioDosificacion"
                type="number"
                min="0"
                step="1"
                value={formData.precioDosificacion}
                onChange={handleNumberChange}
                required
                className="z-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                value={formData.categoriaId}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="categoria" className="z-50">
                  <SelectValue placeholder="Selecciona una categoría">
                    {categories?.find((c) => c.id === formData.categoriaId)
                      ?.nombre || "Selecciona una categoría"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent position="popper" className="z-[100]">
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => !isSubmitting && setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
