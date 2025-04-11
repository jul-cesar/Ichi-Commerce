"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/client";
import { Prisma } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { addToCart } from "../actions";

export function ClientProductActions({
  product,
}: {
  product: Prisma.ProductoGetPayload<{
    include: {
      variaciones: {
        include: {
          atributos: {
            include: {
              valorAtributo: {
                include: {
                  atributo: true;
                };
              };
            };
          };
        };
      };
    };
  }>;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const router = useRouter();
  const queryClient = useQueryClient();

  // Inicializar atributos seleccionados con valores predeterminados
  useEffect(() => {
    if (product.variaciones) {
      const initialAttributes: Record<string, string> = {};
      product.variaciones.forEach((variation) => {
        variation.atributos.forEach((attribute) => {
          const attributeName = attribute.valorAtributo.atributo.nombre;
          const attributeValue = attribute.valorAtributo.valor;
          if (!initialAttributes[attributeName]) {
            initialAttributes[attributeName] = attributeValue; // Selecciona el primer valor encontrado
          }
        });
      });
      setSelectedAttributes(initialAttributes);
    }
  }, [product.variaciones]);

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAttributeChange = (attributeName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  const { data } = authClient.useSession();

  const handleAddToCart = async () => {
    try {
      const cart = await addToCart({
        productId: product.id,
        quantity,
        userId: data?.user.id ?? "",
        attributes: selectedAttributes,
      });
      if (cart.error) {
        toast.error(cart.error);
        return;
      }
      toast.success("Producto añadido al carrito");
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
      router.refresh();
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <>
      <div>
        <h3 className="font-medium mb-3">Cantidad</h3>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-r-none"
            onClick={decreaseQuantity}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex h-8 w-12 items-center justify-center border-y">
            {quantity}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-l-none"
            onClick={increaseQuantity}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-3">Atributos</h3>
        {Object.keys(selectedAttributes).map((attributeName) => (
          <div key={attributeName} className="mb-2">
            <label className="block text-sm font-medium mb-1">
              {attributeName}
            </label>
            <select
              className="w-full border rounded p-2"
              value={selectedAttributes[attributeName] || ""}
              onChange={(e) =>
                handleAttributeChange(attributeName, e.target.value)
              }
            >
              {product.variaciones
                .flatMap((variation) =>
                  variation.atributos.filter(
                    (attr) =>
                      attr.valorAtributo.atributo.nombre === attributeName
                  )
                )
                .map((attr) => (
                  <option
                    key={attr.valorAtributo.valor}
                    value={attr.valorAtributo.valor}
                  >
                    {attr.valorAtributo.valor}
                  </option>
                ))}
            </select>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Button className="w-full" size="lg" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Añadir al carrito
        </Button>
      </div>
    </>
  );
}
