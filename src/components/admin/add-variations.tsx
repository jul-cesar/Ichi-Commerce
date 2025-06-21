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
import { UploadDropzone } from "@/utils/uploadthing";
import type { Prisma } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  children?: React.ReactNode;
};

export function AddVariationModal({
  productId,
  attributes,
  trigger,
}: AddVariationModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImages, setNewImages] = useState<string[]>([]);

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
      setNewImages([]);
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

    try {
      // Check if all attributes have been selected
      if (
        attributes &&
        attributes.length > 0 &&
        Object.keys(selectedAttributes).length < attributes.length
      ) {
        toast.error("Asegurate de llenar todos los campos requeridos");
        setIsSubmitting(false);
        return;
      }

      const data = {
        productoId: productId,
        atributos: Object.entries(selectedAttributes).map(
          ([attributeId, valueId]) => ({
            attributeId,
            valueId,
          })
        ),
        stock: Number(stock),
        images: newImages,
      };

      const newVar = await createVariation(data);

      if (newVar.error) {
        toast.error("Error al crear la variación: " + newVar.error);
      } else {
        toast.success("Variación creada correctamente.");
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error inesperado al crear la variación");
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

  const removeImage = (indexToRemove: number) => {
    setNewImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="size-4" />
            Añadir Variación
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">
            Añadir nueva variación
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Configura los atributos, stock y precio para esta nueva variación
            del producto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected attributes summary */}
          {Object.keys(selectedAttributes).length > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-3">
                Atributos seleccionados:
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedAttributes).map(
                  ([attributeId, valueId]) => {
                    const { name, value } = getAttributeDetails(
                      attributeId,
                      valueId
                    );
                    return (
                      <Badge
                        key={attributeId}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        <span className="font-medium">{name}:</span> {value}
                      </Badge>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Attribute selectors */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Atributos</h3>
              {attributes && attributes.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {Object.keys(selectedAttributes).length}/{attributes.length}{" "}
                  seleccionados
                </Badge>
              )}
            </div>

            {attributes?.length === 0 ? (
              <div className="p-4 border border-dashed rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  No hay atributos definidos. Debes crear atributos primero.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {attributes?.map((attribute) => (
                  <div key={attribute.id} className="space-y-2">
                    <Label
                      htmlFor={`attribute-${attribute.id}`}
                      className="text-sm font-medium"
                    >
                      {attribute.nombre}
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Select
                      value={selectedAttributes[attribute.id] || ""}
                      onValueChange={(value) =>
                        handleAttributeChange(attribute.id, value)
                      }
                    >
                      <SelectTrigger
                        id={`attribute-${attribute.id}`}
                        className={
                          !selectedAttributes[attribute.id]
                            ? "border-muted-foreground/20"
                            : ""
                        }
                      >
                        <SelectValue
                          placeholder={`Seleccionar ${attribute.nombre.toLowerCase()}`}
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
                ))}
              </div>
            )}
          </div>

          {/* Stock and price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-sm font-medium">
                Stock
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Precio (opcional)
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Images upload section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">
                Imágenes de la variación
              </Label>
              {newImages.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {newImages.length}{" "}
                  {newImages.length === 1 ? "imagen" : "imágenes"}
                </Badge>
              )}
            </div>

            <UploadDropzone
              content={{
                button: "Seleccionar archivos",
                allowedContent: "Imágenes hasta 4MB",
                label: "o arrastra y suelta aquí",
              }}
              appearance={{
                button:
                  "bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors",
                container:
                  "border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-muted-foreground/50 transition-colors",
                uploadIcon: "text-muted-foreground w-10 h-10",
                allowedContent: "text-xs text-muted-foreground mt-2",
                label: "text-sm text-muted-foreground",
              }}
              endpoint="imageUploader"
              onUploadBegin={(name) => {
                toast.info(`Subiendo ${name}...`, {
                  description:
                    "Por favor espera mientras procesamos tu archivo",
                });
              }}
              onClientUploadComplete={(res) => {
                if (res && res.length > 0) {
                  const uploadedImages = res.map((file) => file.url);
                  setNewImages((prev) => [...prev, ...uploadedImages]);
                  toast.success("¡Imágenes subidas correctamente!", {
                    description: `Se han subido ${res.length} ${
                      res.length === 1 ? "imagen" : "imágenes"
                    }`,
                  });
                }
              }}
              onUploadError={(error: Error) => {
                toast.error("Error al subir las imágenes", {
                  description: `${
                    error.message || "Ha ocurrido un problema durante la subida"
                  }`,
                });
              }}
            />

            {/* Image preview grid */}
            {newImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {newImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square border rounded-lg overflow-hidden bg-muted"
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Imagen ${index + 1}`}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (attributes && attributes.length === 0)}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Guardando..." : "Crear variación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
