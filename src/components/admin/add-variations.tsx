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
import { Prisma } from "@prisma/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createVariation } from "./actions";

type Attribute =
  | Prisma.AtributoVariacionGetPayload<{
      include: {
        OpcionAtributo: true;
      };
    }>[]
  | undefined;

type AddVariationModalProps = {
  productId: string;
  attributes: Attribute;
  trigger?: React.ReactNode;
  children?: React.ReactNode; // Agregar esta línea para permitir 'children'
};

export function AddVariationModal({
  productId,
  attributes,
  trigger,
}: AddVariationModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedAttributes, setSelectedAttributes] = useState<{
    [key: string]: string;
  }>({});

  const [stock, setStock] = useState("0");
  const [price, setPrice] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSelectedAttributes({});
      setStock("0");
      setPrice("");
    }
  }, [open]);

  const handleAttributeChange = (attributeId: string, valueId: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeId]: valueId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (attributes)
      try {
        // Check if all attributes have been selected
        if (
          attributes?.length > 0 &&
          Object.keys(selectedAttributes).length < attributes?.length
        ) {
          throw new Error("Debes seleccionar un valor para cada atributo");
        }

        // Prepare data for API
        const data = {
          productoId: productId,
          atributos: Object.entries(selectedAttributes).map(
            ([attributeId, valueId]) => ({
              attributeId,
              valueId,
            })
          ),
          stock: Number(stock),
        };

        await createVariation(data); // Call the API to create the variation

        // API call to create variation

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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Añadir variación
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Añadir nueva variación</DialogTitle>
          <DialogDescription>
            Configura los atributos, stock y precio para esta nueva variación
            del producto.
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

              {attributes?.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay atributos definidos. Debes crear atributos primero.
                </p>
              ) : (
                attributes?.map((attribute) => (
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

            {/* Stock and price */}
            <div className="grid grid-cols-2 gap-4">
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
              disabled={isSubmitting || attributes?.length === 0}
            >
              {isSubmitting ? "Guardando..." : "Crear variación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
