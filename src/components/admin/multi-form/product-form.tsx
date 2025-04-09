"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { guardarProducto } from "../actions";
import { useProductForm } from "./formContext";
import ProductInfoStep from "./steps/product-info-step";
import ProductVariationsStep from "./steps/product-variations-step";
import ProductDetailsStep from "./steps/products-details-step";

export default function ProductForm() {
  const { state, prevStep, resetForm } = useProductForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // In a real app, you would submit the form data to your API
      console.log("Submitting form data:", state);
      await guardarProducto(state);

      setIsSuccess(true);
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <ProductInfoStep />;
      case 2:
        return <ProductDetailsStep />;
      case 3:
        return (
          <ProductVariationsStep
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return <ProductInfoStep />;
    }
  };

  if (isSuccess) {
    return (
      <Card className="p-6 max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Producto creado correctamente
          </h2>

          <Button onClick={() => setIsSuccess(false)}>
            Crear otro producto
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full mx-1 ${
                step <= state.currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between">
          <div
            className={`text-sm ${
              state.currentStep === 1 ? "text-primary font-medium" : ""
            }`}
          >
            Informacion del producto
          </div>
          <div
            className={`text-sm ${
              state.currentStep === 2 ? "text-primary font-medium" : ""
            }`}
          >
            Detalles del producto
          </div>
          <div
            className={`text-sm ${
              state.currentStep === 3 ? "text-primary font-medium" : ""
            }`}
          >
            Variaciones
          </div>
        </div>
      </div>

      <Card className="p-6">
        {renderStep()}

        {state.currentStep > 1 && (
          <div className="mt-6 flex justify-start">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              Atras
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
