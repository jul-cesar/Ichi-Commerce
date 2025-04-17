"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { z } from "zod";

// Define types for our attributes and variations
export type Attribute = {
  id: string;
  name: string;
  options: string[];
};

export type Variation = {
  id: string;
  attributes: Record<string, string>; // attributeId: optionValue
  stock: number;
  images: string[];
};

export type Category = {
  id: string;
  name: string;
};

export type ProductFormState = {
  nombre: string;
  descripcion: string;
  precio: string;
  precioPromo: string;
  precioDosificacion: string;
  imagenPrincipal: string;

  categoryId: string;
  selectedAttributeIds: string[];

  variations: Variation[];

  currentStep: number;
};

// Initial state
const initialState: ProductFormState = {
  nombre: "",
  descripcion: "",
  precio: "",
  imagenPrincipal: "",
  precioPromo: "",
  precioDosificacion: "",
  categoryId: "",
  selectedAttributeIds: [],
  variations: [],
  currentStep: 1,
};

// Create context
type ProductFormContextType = {
  state: ProductFormState;
  updateState: (updates: Partial<ProductFormState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  addVariation: (variation: Variation) => void;
  removeVariation: (id: string) => void;
  updateVariation: (id: string, updates: Partial<Variation>) => void;
  resetForm: () => void;
};

const ProductFormContext = createContext<ProductFormContextType | undefined>(
  undefined
);

// Provider component
export function ProductFormProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProductFormState>(initialState);

  const updateState = (updates: Partial<ProductFormState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (state.currentStep < 3) {
      updateState({ currentStep: state.currentStep + 1 });
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1) {
      updateState({ currentStep: state.currentStep - 1 });
    }
  };

  const addVariation = (variation: Variation) => {
    updateState({
      variations: [...state.variations, variation],
    });
  };

  const removeVariation = (id: string) => {
    updateState({
      variations: state.variations.filter((v) => v.id !== id),
    });
  };

  const updateVariation = (id: string, updates: Partial<Variation>) => {
    updateState({
      variations: state.variations.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    });
  };

  const resetForm = () => {
    setState(initialState);
  };

  return (
    <ProductFormContext.Provider
      value={{
        state,
        updateState,
        nextStep,
        prevStep,
        addVariation,
        removeVariation,
        updateVariation,
        resetForm,
      }}
    >
      {children}
    </ProductFormContext.Provider>
  );
}

// Custom hook to use the context
export function useProductForm() {
  const context = useContext(ProductFormContext);
  if (context === undefined) {
    throw new Error("useProductForm must be used within a ProductFormProvider");
  }
  return context;
}

// Zod schemas for validation

export const productInfoSchema = z
  .object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    descripcion: z
      .string()
      .min(10, "La descripción debe tener al menos 10 caracteres"),
    precio: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "El precio debe ser un número positivo",
    }),
    precioPromo: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "El precio promocional debe ser un número positivo",
      }),
    precioDosificacion: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "El precio promocional debe ser un número positivo",
      }),
    imagenPrincipal: z.string().min(1, "Por favor, selecciona una imagen"),
  })
  .refine((data) => Number(data.precioPromo) > Number(data.precio), {
    path: ["precioPromo"],
    message: "El precio promocional debe ser mayor que el precio normal",
  })
  .refine((data) => Number(data.precio) * 2 < Number(data.precioDosificacion), {
    path: ["precioDosifiacion"],
    message: "El precio de la dosoficacion debe ser menor al precio normal x 2",
  });

export const productDetailsSchema = z.object({
  categoryId: z.string().min(1, "Por favor, selecciona una categoría"),
  selectedAttributeIds: z
    .array(z.string())
    .min(1, "Por favor, selecciona al menos un atributo"),
});

export const variationSchema = z.object({
  id: z.string(),
  attributes: z.record(z.string()),
  stock: z.number().int().min(0, "El stock debe ser un número no negativo"),
  images: z.array(z.string()).optional(),
});

export const variationsSchema = z.object({
  variations: z
    .array(variationSchema)
    .min(1, "Por favor, agrega al menos una variación"),
});
