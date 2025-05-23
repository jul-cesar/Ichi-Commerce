"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UploadDropzone } from "@/utils/uploadthing";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAttributes } from "../../actions";
import { useProductForm, Variation, variationsSchema } from "../formContext";

type VariationFormProps = {
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
};

export default function ProductVariationsStep({
  onSubmit,
  isSubmitting,
}: VariationFormProps) {
  const { state, addVariation, removeVariation, updateVariation } =
    useProductForm();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newVariation, setNewVariation] = useState<Partial<Variation>>({
    id: crypto.randomUUID(),
    attributes: {},
    stock: 0,
    images: [],
  });

  const { data: sampleAttributes } = useQuery({
    queryFn: async () => await getAttributes(),
    queryKey: ["attributes"],
  });

  // Get the selected attributes based on IDs
  const selectedAttributes = sampleAttributes?.filter((attr) =>
    state.selectedAttributeIds.includes(attr.id)
  );

  // Check if all attributes are selected for the new variation
  const isNewVariationComplete = () => {
    if (!newVariation.attributes) return false;

    return selectedAttributes?.every(
      (attr) =>
        newVariation.attributes &&
        newVariation.attributes[attr.id] !== undefined
    );
  };

  // Check if this variation already exists
  const isDuplicateVariation = () => {
    if (!newVariation.attributes) return false;

    return state.variations.some((variation) => {
      // Compare each attribute value
      return selectedAttributes?.every(
        (attr) =>
          variation.attributes[attr.id] === newVariation.attributes?.[attr.id]
      );
    });
  };

  const handleAttributeChange = (attributeId: string, value: string) => {
    setNewVariation((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeId]: value,
      },
    }));
  };

  const handleStockChange = (value: string) => {
    setNewVariation((prev) => ({
      ...prev,
      stock: Number.parseInt(value) || 0,
    }));
  };

  const handleAddVariation = () => {
    if (!isNewVariationComplete()) {
      setErrors({
        general: "Por favor seleccion todos los atributos para esta variacion",
      });
      return;
    }

    if (isDuplicateVariation()) {
      setErrors({ general: "Esta variacion ya existe" });
      return;
    }

    if ((newVariation.stock || 0) < 0) {
      setErrors({ stock: "El stock no puede ser negativo" });
      return;
    }

    // Add the new variation
    addVariation({
      id: newVariation.id as string,
      attributes: newVariation.attributes as Record<string, string>,
      stock: newVariation.stock as number,
      images: newVariation.images || [],
    });

    // Reset the form for a new variation
    setNewVariation({
      id: crypto.randomUUID(),
      attributes: {},
      stock: 0,
      images: [],
    });
    setErrors({});
  };

  const handleSubmitForm = () => {
    try {
      // Validate variations
      variationsSchema.parse({
        variations: state.variations,
      });

      // If validation passes, submit the form
      setErrors({});
      onSubmit();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to a more usable format
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            formattedErrors[err.path[0].toString()] = err.message;
          } else {
            formattedErrors.general = err.message;
          }
        });
        setErrors(formattedErrors);
      }
    }
  };

  // Get a readable name for a variation
  const getVariationName = (variation: Variation) => {
    return selectedAttributes
      ?.map((attr) => {
        // Get the selected option ID for this attribute
        const selectedOptionId = variation.attributes[attr.id];

        // Find the option object that matches this ID
        const selectedOption = attr.OpcionAtributo.find(
          (option) => option.id === selectedOptionId
        );

        // Return the formatted string with attribute name and option name
        return `${attr.nombre}: ${
          selectedOption ? selectedOption.valor : "Not selected"
        }`;
      })
      .join(", ");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Variaciones del producto</h2>

      {selectedAttributes?.length === 0 ? (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
          Por favor selecciona al menos un atributo para crear variaciones.
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Agrega una nueva variacion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedAttributes?.map((attribute) => (
                <div key={attribute.id}>
                  <Label htmlFor={`attr-${attribute.id}`}>
                    {attribute.nombre}
                  </Label>
                  <Select
                    value={newVariation.attributes?.[attribute.id] || ""}
                    onValueChange={(value) =>
                      handleAttributeChange(attribute.id, value)
                    }
                  >
                    <SelectTrigger id={`attr-${attribute.id}`}>
                      <SelectValue placeholder={`Select ${attribute.nombre}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {attribute.OpcionAtributo.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.valor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              <div>
                <Label htmlFor="stock">Cantidad stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={newVariation.stock || ""}
                  onChange={(e) => handleStockChange(e.target.value)}
                  placeholder="0"
                  className={errors.stock ? "border-red-500" : ""}
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                )}
              </div>

              {/* Upload multiple images for the variation */}
              <div>
                <Label htmlFor="variationImages">
                  Imágenes de la variación
                </Label>
                <UploadDropzone
                  content={{
                    button: "Seleccionar archivos",
                    allowedContent: "Imágenes hasta 4MB",
                    label: "o arrastra y suelta aquí",
                  }}
                  appearance={{
                    button:
                      "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors",
                    container:
                      "flex flex-col items-center justify-center gap-4",
                    uploadIcon: "text-blue-500 w-12 h-12",
                    allowedContent: "text-sm text-gray-500",
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
                      const newImages = res.map((file) => file.url);
                      setNewVariation((prev: any) => ({
                        ...prev,
                        images: [...(prev.images || []), ...newImages],
                      }));
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
                        error.message ||
                        "Ha ocurrido un problema durante la subida"
                      }`,
                    });
                  }}
                />
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {newVariation.images?.map((image, index) => (
                    <div
                      key={index}
                      className="relative w-32 h-32 border rounded-md overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`Uploaded ${index}`}
                        className="object-cover w-full h-full"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() =>
                          setNewVariation((prev) => ({
                            ...prev,
                            images: prev.images?.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="button"
                onClick={handleAddVariation}
                className="w-full"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" /> Agregar variacion
              </Button>
            </CardFooter>
          </Card>

          {errors.general && (
            <p className="text-red-500 text-sm">{errors.general}</p>
          )}

          {state.variations.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium">Variaciones agregadas</h3>
              <div className="space-y-3">
                {state.variations.map((variation) => (
                  <div
                    key={variation.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">
                        {getVariationName(variation)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {variation.stock}
                      </p>
                      <div className="mt-2 flex gap-2">
                        {variation.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Variation ${index}`}
                            className="w-12 h-12 object-cover rounded-md border"
                          />
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariation(variation.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted/50 rounded-md text-center text-muted-foreground">
              No se han agregado variaciones aun
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSubmitForm}
              disabled={state.variations.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Agregando..." : "Agregar producto"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
