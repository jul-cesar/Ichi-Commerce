"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { z } from "zod";
import { productInfoSchema, useProductForm } from "../formContext";

export default function ProductInfoStep() {
  const { state, updateState, nextStep } = useProductForm();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateState({ imagenPrincipal: e.target.files[0] });
    }
  };

  const removeImage = () => {
    updateState({ imagenPrincipal: null });
  };

  const validateAndContinue = () => {
    try {
      // Validate the current step data
      productInfoSchema.parse({
        nombre: state.nombre,
        descripcion: state.descripcion,
        precio: state.precio,
        imagenPrincipal: state.imagenPrincipal, // This needs to match the schema field name
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
            placeholder="Enter product name"
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
            placeholder="Enter product description"
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
          <Label htmlFor="image">Imagen del producto</Label>

          {state.imagenPrincipal ? (
            <div className="mt-2 relative w-40 h-40 border rounded-md overflow-hidden">
              <Image
                src={
                  URL.createObjectURL(state.imagenPrincipal) ||
                  "/placeholder.svg"
                }
                alt="Product preview"
                fill
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
              <Label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
              >
                <ImagePlus className="w-8 h-8 text-muted-foreground" />
                <span className="mt-2 text-sm text-muted-foreground">
                  Subir imagen
                </span>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </Label>
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
