"use client";

import CheckoutModal from "@/app/order/nuevo/OrderModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ShoppingCart, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ClientProductActionsProps = {
  promoPorcent?: number;
  product: {
    variaciones: {
      id: string;
      stock: number; // Include stock information
      atributos: {
        valorAtributo: {
          atributo: { nombre: string };
          valor: string;
        };
      }[];
    }[];
    id: string;
    nombre: string;
    precio: number;
    precioPromo: number;
    precioDosificacion: number | null;
  };
  selectedAttributes: { [key: string]: string }; // Selected attributes from AtributesSelect
};

export type SelectedProduct = {
  productId: string;
  variacionId: string;
  nombre: string; // Add product name
  quantity: number;
  attributes: { [key: string]: string };
  price: number;
  priceDosificacion: number | null;
  variaciones: {
    id: string;
    stock: number;
    atributos: {
      valorAtributo: {
        atributo: { nombre: string };
        valor: string;
      };
    }[];
  }[]; // Add variations property
};

export const ClientProductActions = ({
  product,
  promoPorcent,
  selectedAttributes,
}: ClientProductActionsProps) => {
  const [loading, setLoading] = useState(false);
  const [canAddToCart, setCanAddToCart] = useState(false);
  const [quantity, setQuantity] = useState(1); // State for quantity
  const [isSpecialOffer, setIsSpecialOffer] = useState(false); // State for special offer
  const [secondAttributes, setSecondAttributes] = useState<{
    [key: string]: string;
  }>({});
  const [availableAttributes, setAvailableAttributes] = useState<{
    [key: string]: string[];
  }>({});
  const [allAttributes, setAllAttributes] = useState<{
    [key: string]: string[];
  }>({});
  const queryClient = useQueryClient();
  const [attributesNeeded, setAttributesNeeded] = useState(2);
  const router = useRouter();
  const [selectedProductsForCheckout, setSelectedProductsForCheckout] =
    useState<SelectedProduct[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Populate attributes and options based on product variations
  useEffect(() => {
    const attributesFound: string[] = [];
    const optionsByAttribute: { [key: string]: string[] } = {};

    if (product.variaciones) {
      product.variaciones.forEach((variacion) => {
        if (variacion.stock > 0) {
          variacion.atributos.forEach((atributo) => {
            const attributeName = atributo.valorAtributo.atributo.nombre;
            const attributeValue = atributo.valorAtributo.valor;

            if (!attributesFound.includes(attributeName)) {
              attributesFound.push(attributeName);
            }

            if (!optionsByAttribute[attributeName]) {
              optionsByAttribute[attributeName] = [];
            }

            if (!optionsByAttribute[attributeName].includes(attributeValue)) {
              optionsByAttribute[attributeName].push(attributeValue);
            }
          });
        }
      });
    }

    setAllAttributes(optionsByAttribute);
    setAvailableAttributes(optionsByAttribute);
  }, [product]);

  // Update available options based on selected attributes
  useEffect(() => {
    const updatedOptions: { [key: string]: string[] } = {};

    Object.keys(allAttributes).forEach((attribute) => {
      const otherSelections = { ...secondAttributes };
      delete otherSelections[attribute]; // Exclude the current attribute from the filter

      const validVariations = product.variaciones.filter((variacion) => {
        return (
          variacion.stock > 0 &&
          Object.entries(otherSelections).every(([attrName, attrValue]) =>
            variacion.atributos.some(
              (attr) =>
                attr.valorAtributo.atributo.nombre === attrName &&
                attr.valorAtributo.valor === attrValue
            )
          )
        );
      });

      const availableOptions: string[] = [];
      validVariations.forEach((variacion) => {
        variacion.atributos.forEach((atributo) => {
          if (atributo.valorAtributo.atributo.nombre === attribute) {
            const value = atributo.valorAtributo.valor;
            if (!availableOptions.includes(value)) {
              availableOptions.push(value);
            }
          }
        });
      });

      updatedOptions[attribute] = availableOptions;
    });

    setAvailableAttributes(updatedOptions);
  }, [secondAttributes, allAttributes, product]);

  // Validate that at least two attributes are selected
  useEffect(() => {
    const selectedCount = Object.keys(selectedAttributes).length;
    const hasEnoughAttributes = selectedCount >= 2;
    setCanAddToCart(hasEnoughAttributes);
    setAttributesNeeded(Math.max(0, 2 - selectedCount));
  }, [selectedAttributes]);

  const handleProceedToOrder = () => {
    const selectedProducts: SelectedProduct[] = [];

    // Find the variation ID for the first product
    const firstVariationId =
      product.variaciones.find((variacion) =>
        Object.entries(selectedAttributes).every(([key, value]) =>
          variacion.atributos.some(
            (attr) =>
              attr.valorAtributo.atributo.nombre === key &&
              attr.valorAtributo.valor === value
          )
        )
      )?.id || "";

    // Add the first product
    selectedProducts.push({
      productId: product.id,
      variacionId: firstVariationId,
      nombre: product.nombre,
      quantity: isSpecialOffer ? 1 : quantity, // Start with quantity 1 for special offer
      attributes: selectedAttributes,
      price: isSpecialOffer
        ? product.precio // Use regular price for quantity 1
        : product.precio, // Use regular price for non-special offer
      priceDosificacion: product.precioDosificacion,
      variaciones: product.variaciones, // Include variations
    });

    // Handle the second product for the special offer
    if (isSpecialOffer && Object.keys(secondAttributes).length > 0) {
      const secondVariationId =
        product.variaciones.find((variacion) =>
          Object.entries(secondAttributes).every(([key, value]) =>
            variacion.atributos.some(
              (attr) =>
                attr.valorAtributo.atributo.nombre === key &&
                attr.valorAtributo.valor === value
            )
          )
        )?.id || "";

      // Check if the second product matches the first product
      const isSameVariation = firstVariationId === secondVariationId;

      if (isSameVariation) {
        // Update the quantity of the first product to 2
        selectedProducts[0].quantity = 2;
        selectedProducts[0].price =
          product.precioDosificacion ?? product.precio * 2; // Use priceDosificacion for 2 items
      } else {
        // Check if the second variation already exists in the selectedProducts array
        const existingProductIndex = selectedProducts.findIndex(
          (product) => product.variacionId === secondVariationId
        );

        if (existingProductIndex !== -1) {
          // If it exists, increment the quantity
          selectedProducts[existingProductIndex].quantity += 1;
        } else {
          // Add the second product as a separate entry
          selectedProducts.push({
            productId: product.id,
            variacionId: secondVariationId,
            nombre: product.nombre,
            quantity: 1,
            attributes: secondAttributes,
            price: product.precio,
            priceDosificacion: product.precioDosificacion,
            variaciones: product.variaciones, // Include variations
          });
        }
      }
    }

    setSelectedProductsForCheckout(selectedProducts);
    setIsCheckoutModalOpen(true);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      setQuantity(newQuantity);
      // Reset special offer when manually changing quantity
      if (isSpecialOffer && newQuantity !== 2) {
        setIsSpecialOffer(false);
      }
    }
  };

  const toggleSpecialOffer = () => {
    setIsSpecialOffer(!isSpecialOffer);
    if (!isSpecialOffer) {
      setQuantity(2); // Set quantity to 2 when enabling special offer
    } else {
      setQuantity(1); // Reset to 1 when disabling special offer
    }
  };

  const handleSecondAttributeChange = (attribute: string, value: string) => {
    setSecondAttributes((prev) => {
      const updated = { ...prev };
      if (updated[attribute] === value) {
        delete updated[attribute]; // Deselect the attribute if it's already selected
      } else {
        updated[attribute] = value; // Select the new value
      }
      return updated;
    });
  };

  // Calculate regular price based on quantity
  const regularPrice = product.precio * quantity;
  const regularPromoPrice = product.precioPromo * quantity;

  // Calculate special offer price (30% discount for 2 items)
  const specialOfferDiscount = 0.25; // 25% discount
  const specialOfferPrice = product.precioDosificacion ?? product.precio * 2; // Fallback to original price * 2 if null
  const specialOfferOriginalPrice = product.precio * 2;

  // Determine which price to display
  const totalPrice = isSpecialOffer ? specialOfferPrice : regularPrice;
  const promoTotalPrice = isSpecialOffer
    ? specialOfferOriginalPrice
    : regularPromoPrice;

  return (
    <Card className="p-5 space-y-6 border-muted-foreground/20">
      {/* Special offer banner */}
      <div
        className={cn(
          "border-2 rounded-lg overflow-hidden transition-all",
          isSpecialOffer
            ? "border-red-500 bg-red-50"
            : "border-gray-200 bg-gray-50 hover:border-red-300"
        )}
      >
        <button
          onClick={toggleSpecialOffer}
          className="w-full text-left"
          disabled={loading}
        >
          <div className="flex items-center p-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Tag
                  className={cn(
                    "h-5 w-5",
                    isSpecialOffer ? "text-red-500" : "text-gray-500"
                  )}
                />
                <span className="font-bold text-base">¡LLÉVATE 2 PARES!</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Badge className="bg-red-500">
                  {`${Math.round(
                    ((product.precio * 2 -
                      (product.precioDosificacion ?? product.precio * 2)) /
                      (product.precio * 2)) *
                      100
                  )}% DESCUENTO`}
                </Badge>
                <span className="text-md font-semibold line-through text-gray-500">
                  ${(product.precio * 2).toLocaleString("es-CO")}
                </span>
                <span className="font-bold">
                  $
                  {(
                    product.precioDosificacion ?? product.precio * 2
                  ).toLocaleString("es-CO")}
                </span>
              </div>
              <p className="text-xs mt-1 text-gray-600">
                ¡Ahorra $
                {(
                  product.precio * 2 -
                  (product.precioDosificacion ?? product.precio * 2)
                ).toLocaleString("es-CO")}{" "}
                con esta oferta especial!
              </p>
            </div>
            <div className="flex items-center justify-center h-6 w-6 rounded-full border">
              {isSpecialOffer ? (
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
              ) : null}
            </div>
          </div>
        </button>
      </div>

      {/* Price and quantity section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Precio unitario</p>
            <p className="text-2xl font-bold">
              ${product.precio.toLocaleString("es-CO")}
            </p>
          </div>

          <div className="space-y-1 text-right">
            <p className="text-sm text-muted-foreground">Total</p>

            {(product.precioPromo > 0 || isSpecialOffer) && (
              <div>
                <p className="">Antes</p>
                <p className="text-2xl font-semibold line-through">
                  ${promoTotalPrice.toLocaleString("es-CO")}
                </p>
              </div>
            )}
            <p>Ahora</p>
            <p className="text-2xl font-bold text-primary">
              ${totalPrice.toLocaleString("es-CO")}
            </p>
          </div>
        </div>

        {/* Secondary attributes selection for the second product */}
        {isSpecialOffer && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Selecciona atributos para el segundo producto
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(allAttributes).map((attribute) => (
                <div key={attribute} className="flex flex-col">
                  <label className="text-xs font-medium">{attribute}</label>
                  <div className="flex flex-wrap gap-2">
                    {allAttributes[attribute].map((option) => {
                      const isAvailable =
                        availableAttributes[attribute]?.includes(option);
                      const isSelected = secondAttributes[attribute] === option;

                      return (
                        <button
                          key={option}
                          onClick={() =>
                            isAvailable &&
                            handleSecondAttributeChange(attribute, option)
                          }
                          disabled={!isAvailable}
                          className={cn(
                            "px-3 py-1.5 rounded-md border transition-all",
                            isSelected
                              ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                            !isAvailable && "opacity-30 cursor-not-allowed"
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected attributes feedback */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Atributos seleccionados</p>
          <Badge
            variant={canAddToCart ? "default" : "destructive"}
            className="text-xs"
          >
            {canAddToCart ? "Completo" : `Faltan ${attributesNeeded}`}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(selectedAttributes).map(([key, value]) => (
            <Badge key={key} variant="outline" className="text-xs">
              {key}: {value}
            </Badge>
          ))}
        </div>

        {!canAddToCart && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span>Selecciona al menos 2 atributos para continuar</span>
          </div>
        )}
      </div>

      {/* Add to cart button */}
      <Button
        onClick={handleProceedToOrder}
        disabled={
          loading ||
          !canAddToCart ||
          (isSpecialOffer &&
            Object.keys(secondAttributes).length <
              Object.keys(allAttributes).length)
        }
        className="w-full h-12 text-base font-medium bg-green-500"
        size="lg"
      >
        <ShoppingCart className="mr-2 h-5 w-5 " />
        {loading
          ? "Procesando..."
          : isSpecialOffer
          ? "¡Comprar 2 con descuento!"
          : "Pagar contraentrega"}
      </Button>

      {/* Free shipping notice */}
      <div className="text-center text-sm text-green-600 font-medium">
        ENVÍO GRATIS a toda Colombia
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        promoPercent={promoPorcent}
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        products={selectedProductsForCheckout}
      />
    </Card>
  );
};
