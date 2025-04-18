"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/utils/uploadthing";
import { Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { productInfoSchema, useProductForm } from "../formContext";

export default function ProductInfoStep() {
  const { state, updateState, nextStep } = useProductForm();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const validateAndContinue = () => {
    try {
      // Validate the current step data
      productInfoSchema.parse({
        nombre: state.nombre,
        descripcion: state.descripcion,
        precio: state.precio,
        imagenPrincipal: state.imagenPrincipal, // This needs to match the schema field name
        precioPromo: state.precioPromo,
        precioDosificacion: state.precioDosificacion,
      });

      // If validation passes, go to next step
      setErrors({});
      nextStep();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to a more usable format
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
    }
  };

  const removeImage = () => {
    updateState({ imagenPrincipal: "" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Informacion basica del producto</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre del producto</Label>
          <Input
            id="name"
            value={state.nombre}
            onChange={(e) => updateState({ nombre: e.target.value })}
            placeholder="Ingresa el nombre del producto"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.nombre && (
            <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Descripcion</Label>
          <Textarea
            id="description"
            value={state.descripcion}
            onChange={(e) => updateState({ descripcion: e.target.value })}
            placeholder="Ingresa la descripcion del producto"
            rows={4}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.descripcion && (
            <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
          )}
        </div>

        <div>
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            value={state.precio}
            onChange={(e) => updateState({ precio: e.target.value })}
            placeholder="0.00"
            type="text"
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.precio && (
            <p className="text-red-500 text-sm mt-1">{errors.precio}</p>
          )}
        </div>

        <div>
          <Label htmlFor="pricePromo">
            Precio promocional (precio "anterior")
          </Label>
          <Input
            id="pricePromo"
            value={state.precioPromo}
            onChange={(e) => updateState({ precioPromo: e.target.value })}
            placeholder="0.00"
            type="text"
            className={errors.precioPromo ? "border-red-500" : ""}
          />
          {errors.precioPromo && (
            <p className="text-red-500 text-sm mt-1">{errors.precioPromo}</p>
          )}
        </div>
        <div>
          <Label htmlFor="precioDosificacion">Precio dosificacion (precio de la promo de 2)</Label>
          <Input
            id="precioDosificacion"
            value={state.precioDosificacion}
            onChange={(e) =>
              updateState({ precioDosificacion: e.target.value })
            }
            placeholder="0.00"
            type="text"
            className={errors.precioPromo ? "border-red-500" : ""}
          />
          {errors.precioPromo && (
            <p className="text-red-500 text-sm mt-1">
              {errors.precioDosificacion}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="image">Imagen del producto</Label>

          {state.imagenPrincipal ? (
            <div className="mt-2 relative w-40 h-40 border rounded-md overflow-hidden">
              <img
                src={state.imagenPrincipal}
                alt="Product preview"
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="mt-2">
              <UploadButton
                className="border-border text-black"
                endpoint="imageUploader"
                appearance={{
                  button: `ut-ready:bg-gradient-to-r from-blue-500 to-blue-600 
                  ut-uploading:from-blue-400 ut-uploading:to-blue-500 
                  h-full p-4 ut-uploading:cursor-not-allowed rounded-md 
                  shadow-md hover:shadow-lg transition-all duration-200 
                  ut-uploaded:from-green-500 ut-uploaded:to-green-600`,
                  container:
                    "w-max flex rounded-md border border-blue-300 overflow-hidden",
                  allowedContent:
                    "flex h-8 flex-col items-center justify-center px-3 text-white",
                }}
                content={{
                  button({ ready, isUploading }) {
                    if (isUploading) {
                      return (
                        <div className="flex items-center gap-2 text-white">
                          <Loader2 className="animate-spin size-5" />
                          <span>Subiendo...</span>
                        </div>
                      );
                    }

                    if (ready) {
                      return (
                        <div className="flex items-center gap-2 text-white">
                          <Upload className="size-5" />
                          <span>Subir imagen principal</span>
                        </div>
                      );
                    }

                    return (
                      <div className="flex items-center gap-2 text-white">
                        <Loader2 className="animate-spin size-5" />
                        <span>Preparando...</span>
                      </div>
                    );
                  },
                  allowedContent({ isUploading }) {
                    if (isUploading) {
                      return (
                        <Loader2 className="animate-spin size-4 text-blue-200" />
                      );
                    }
                    return <span className="text-xs">JPG, PNG, WebP</span>;
                  },
                }}
                onClientUploadComplete={(res) => {
                  if (res && res.length > 0) {
                    // Update the state with the uploaded image URL
                    updateState({ imagenPrincipal: res[0].ufsUrl });

                    toast.success("Imagen subida correctamente", {
                      description: "La imagen principal ha sido actualizada",
                    });
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error("Error al subir la imagen", {
                    description:
                      error.message ||
                      "Ha ocurrido un problema durante la subida",
                  });
                }}
              />
              {errors.imagenPrincipal && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.imagenPrincipal}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={validateAndContinue}>Siguiente</Button>
      </div>
    </div>
  );
}
