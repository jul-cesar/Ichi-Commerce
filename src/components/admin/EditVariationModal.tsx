"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
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
import type { Prisma } from "@prisma/client";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { actualizarVariacion } from "./actions";

type Attribute = Prisma.AtributoVariacionGetPayload<{
  include: {
    OpcionAtributo: true;
  };
}>;

type Variation = {
  id: string;
  stock: number;
  atributos: Array<{
    id: string;
    valorAtributo: {
      id: string;
      valor: string;
      atributo: {
        id: string;
        nombre: string;
      };
    };
  }>;
};

type EditVariationModalProps = {
  productId: string;
  variation: Variation;
  attributes: Attribute[] | undefined;
  trigger?: React.ReactNode;
};

export function EditVariationModal({
  productId,
  variation,
  attributes,
  trigger,
}: EditVariationModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize selected attributes from the variation
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [stock, setStock] = useState("");

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      // Create a fresh object with the initial attributes
      const initialAttrs = variation.atributos.reduce((acc, attr) => {
        acc[attr.valorAtributo.atributo.id] = attr.valorAtributo.id;
        return acc;
      }, {} as Record<string, string>);

      setSelectedAttributes(initialAttrs);
      setStock(variation.stock.toString());
    }
  }, [open, variation]);

  const handleAttributeChange = (attributeId: string, valueId: string) => {
    console.log("Changing attribute", attributeId, "to value", valueId);
    setSelectedAttributes((prev) => {
      const updated = { ...prev, [attributeId]: valueId };
      console.log("Updated attributes:", updated);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (
        attributes &&
        attributes.length > 0 &&
        Object.keys(selectedAttributes).length < attributes.length
      ) {
        throw new Error("Debes seleccionar un valor para cada atributo");
      }

      console.log("Submitting with attributes:", selectedAttributes);

      // Prepare data for API
      const data = {
        productId,
        variationId: variation.id,
        attributes: Object.entries(selectedAttributes).map(
          ([attributeId, valueId]) => ({
            attributeId,
            valueId,
          })
        ),
        stock: Number(stock),
      };

      // API call to update variation
      const edit = await actualizarVariacion(data);

      if (edit.success) {
        toast.success("Variacion editada con exito");
      } else {
        toast.error(edit.error || "Error al editar la variación");
      }
      // Close modal and refresh page
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      // You could add toast notifications here
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get attribute name and value for display
  const getAttributeDetails = (attributeId: string, valueId: string) => {
    const attribute = attributes?.find((attr) => attr.id === attributeId);
    if (!attribute) return { name: "", value: "" };

    const value = attribute.OpcionAtributo.find((val) => val.id === valueId);
    return {
      name: attribute.nombre,
      value: value?.valor || "",
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Editar variación
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar variación</DialogTitle>
          <DialogDescription>
            Modifica los atributos, stock y precio de esta variación del
            producto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Selected attributes summary */}
            {Object.keys(selectedAttributes).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {Object.entries(selectedAttributes).map(
                  ([attributeId, valueId]) => {
                    const { name, value } = getAttributeDetails(
                      attributeId,
                      valueId
                    );
                    return (
                      <Badge key={attributeId} variant="outline">
                        {name}: {value}
                      </Badge>
                    );
                  }
                )}
              </div>
            )}

            {/* Attribute selectors */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Atributos</h3>

              {!attributes || attributes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay atributos definidos. Debes crear atributos primero.
                </p>
              ) : (
                attributes.map((attribute) => (
                  <div key={attribute.id} className="grid gap-2">
                    <Label htmlFor={`attribute-${attribute.id}`}>
                      {attribute.nombre}
                    </Label>
                    <Select
                      value={selectedAttributes[attribute.id] || ""}
                      onValueChange={(value) =>
                        handleAttributeChange(attribute.id, value)
                      }
                    >
                      <SelectTrigger id={`attribute-${attribute.id}`}>
                        <SelectValue
                          placeholder={`Seleccionar ${attribute.nombre}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {attribute.OpcionAtributo.map((value) => (
                          <SelectItem key={value.id} value={value.id}>
                            {value.valor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))
              )}
            </div>

            {/* Stock */}
            <div className="grid gap-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !attributes || attributes.length === 0}
            >
              {isSubmitting ? "Guardando..." : "Actualizar variación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
