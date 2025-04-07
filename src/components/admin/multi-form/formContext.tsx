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
};

export type Category = {
  id: string;
  name: string;
};

export type ProductFormState = {
  nombre: string;
  descripcion: string;
  precio: string;
  imagenPrincipal: File | null;

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
  imagenPrincipal: null,
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
export const productInfoSchema = z.object({
  nombre: z.string().min(3, "Name must be at least 3 characters"),
  descripcion: z.string().min(10, "Description must be at least 10 characters"),
  precio: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  imagenPrincipal: z
    .instanceof(File)
    .nullable()
    .refine((file) => {
      if (!file) return false;
      return file.size < 5 * 1024 * 1024; // 5MB
    }, "Image must be less than 5MB"),
});

export const productDetailsSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  selectedAttributeIds: z
    .array(z.string())
    .min(1, "Please select at least one attribute"),
});

export const variationSchema = z.object({
  id: z.string(),
  attributes: z.record(z.string()),
  stock: z.number().int().min(0, "Stock must be a non-negative number"),
});

export const variationsSchema = z.object({
  variations: z
    .array(variationSchema)
    .min(1, "Please add at least one variation"),
});
