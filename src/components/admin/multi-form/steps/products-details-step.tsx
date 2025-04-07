"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { getAttributes, getCategories } from "../../actions";
import { productDetailsSchema, useProductForm } from "../formContext";

export default function ProductDetailsStep() {
  const { state, updateState, nextStep } = useProductForm();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCategoryChange = (value: string) => {
    updateState({ categoryId: value });
  };

  const handleAttributeToggle = (attributeId: string) => {
    const currentAttributes = [...state.selectedAttributeIds];

    if (currentAttributes.includes(attributeId)) {
      // Remove attribute if already selected
      updateState({
        selectedAttributeIds: currentAttributes.filter(
          (id) => id !== attributeId
        ),
      });
    } else {
      // Add attribute if not selected
      updateState({
        selectedAttributeIds: [...currentAttributes, attributeId],
      });
    }
  };

  const validateAndContinue = () => {
    try {
      
      productDetailsSchema.parse({
        categoryId: state.categoryId,
        selectedAttributeIds: state.selectedAttributeIds,
      });

      // If validation passes, go to next step
      setErrors({});

      // Initialize variations if attributes have changed
      if (state.selectedAttributeIds.length > 0) {
        // Reset variations when attributes change
        updateState({ variations: [] });
      }

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

  const { data: sampleCategories } = useQuery({
    queryFn: async () => await getCategories(),
    queryKey: ["categories"],
  });

  const { data: sampleAttributes } = useQuery({
    queryFn: async () => await getAttributes(),
    queryKey: ["attributes"],
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Product Details</h2>

      <div className="space-y-6">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={state.categoryId} onValueChange={handleCategoryChange}>
            <SelectTrigger
              id="category"
              className={errors.categoryId ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {sampleCategories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
          )}
        </div>

        <div>
          <Label className="block mb-2">Attributes</Label>
          <div className="space-y-3">
            {sampleAttributes?.map((attribute) => (
              <div key={attribute.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`attribute-${attribute.id}`}
                  checked={state.selectedAttributeIds.includes(attribute.id)}
                  onCheckedChange={() => handleAttributeToggle(attribute.id)}
                />
                <Label
                  htmlFor={`attribute-${attribute.id}`}
                  className="cursor-pointer"
                >
                  {attribute.nombre}
                </Label>
              </div>
            ))}
          </div>
          {errors.selectedAttributeIds && (
            <p className="text-red-500 text-sm mt-1">
              {errors.selectedAttributeIds}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={validateAndContinue}>Next</Button>
      </div>
    </div>
  );
}
