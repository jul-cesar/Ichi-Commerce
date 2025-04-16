"use client";

import { addToCart } from "@/app/productos/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, LucideLoader, ShoppingCart, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ClientProductActionsProps = {
  product: {
    id: string;
    nombre: string;
    precio: number;
    precioPromo: number;
  };
  selectedAttributes: { [key: string]: string }; // Selected attributes from AtributesSelect
};

export const ClientProductActions = ({
  product,
  selectedAttributes,
}: ClientProductActionsProps) => {
  const [loading, setLoading] = useState(false);
  const [canAddToCart, setCanAddToCart] = useState(false);
  const [quantity, setQuantity] = useState(1); // State for quantity
  const [isSpecialOffer, setIsSpecialOffer] = useState(false); // State for special offer
  const queryClient = useQueryClient();
  const [attributesNeeded, setAttributesNeeded] = useState(2);
  const router = useRouter();

  // Validate that at least two attributes are selected
  useEffect(() => {
    const selectedCount = Object.keys(selectedAttributes).length;
    const hasEnoughAttributes = selectedCount >= 2;
    setCanAddToCart(hasEnoughAttributes);
    setAttributesNeeded(Math.max(0, 2 - selectedCount));
  }, [selectedAttributes]);

  const handleAddToCart = async () => {
    if (!canAddToCart) return; // Prevent adding to cart if validation fails

    setLoading(true);

    try {
      const result = await addToCart({
        productId: product.id,
        quantity: isSpecialOffer ? 2 : quantity, // Use 2 if special offer is selected
        attributes: selectedAttributes, // Pass selected attributes
      });

      if (result.success) {
        toast(
          <div className="flex items-center gap-2">
            <LucideLoader className="animate-spin size-4" />
            Procediendo con la orden
          </div>
        );
        queryClient.invalidateQueries({ queryKey: ["cartItems"] }); // Invalidate cart items query to
        router.push("/order/nuevo"); // Redirect to cart page
      } else {
        toast.error("Error al agregar al carrito:", result.error);
      }
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    } finally {
      setLoading(false);
    }
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

  // Calculate regular price based on quantity
  const regularPrice = product.precio * quantity;
  const regularPromoPrice = product.precioPromo * quantity;

  // Calculate special offer price (30% discount for 2 items)
  const specialOfferDiscount = 0.25; // 25% discount
  const specialOfferPrice = Math.round(
    product.precio * 2 * (1 - specialOfferDiscount)
  );
  const specialOfferOriginalPrice = product.precio * 2;

  // Determine which price to display
  const totalPrice = isSpecialOffer ? specialOfferPrice : regularPrice;
  const promoTotalPrice = isSpecialOffer
    ? specialOfferOriginalPrice
    : regularPromoPrice;

  // Calculate savings for special offer
  const savings = specialOfferOriginalPrice - specialOfferPrice;

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
                <Badge className="bg-red-500">50% DESCUENTO</Badge>
                <span className="text-sm line-through text-gray-500">
                  ${specialOfferOriginalPrice.toLocaleString("es-CO")}
                </span>
                <span className="font-bold">
                  ${specialOfferPrice.toLocaleString("es-CO")}
                </span>
              </div>
              <p className="text-xs mt-1 text-gray-600">
                ¡Ahorra ${savings.toLocaleString("es-CO")} con esta oferta
                especial!
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

        {/* Quantity selector - only show if not using special offer */}
        {/* {!isSpecialOffer && (
          <div className="flex items-center justify-center mt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || loading}
              className="h-10 w-10 rounded-full"
            >
              <MinusCircle
                className={cn(
                  "h-6 w-6",
                  quantity <= 1
                    ? "text-muted-foreground/40"
                    : "text-muted-foreground"
                )}
              />
              <span className="sr-only">Disminuir cantidad</span>
            </Button>

            <div className="w-16 text-center">
              <span className="text-xl font-semibold">{quantity}</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={loading}
              className="h-10 w-10 rounded-full"
            >
              <PlusCircle className="h-6 w-6 text-primary" />
              <span className="sr-only">Aumentar cantidad</span>
            </Button>
          </div>
        )} */}
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
        onClick={handleAddToCart}
        disabled={loading || !canAddToCart}
        className="w-full h-12 text-base font-medium bg-green-500"
        size="lg"
      >
        <ShoppingCart className="mr-2 h-5 w-5 " />
        {loading
          ? "Agregando..."
          : isSpecialOffer
          ? "¡Comprar 2 con descuento!"
          : "Pagar contraentrega"}
      </Button>

      {/* Free shipping notice */}
      <div className="text-center text-sm text-green-600 font-medium">
        ENVÍO GRATIS a toda Colombia
      </div>
    </Card>
  );
};
