"use client";
import {
  getCartItems,
  removeFromCart,
  updateCartItemQuantity,
} from "@/app/productos/actions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Separator } from "./ui/separator";

export default function CartSheet() {
  const { data: session } = authClient.useSession();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cartItems", session?.user?.id], // Include userId in query key
    queryFn: () => getCartItems(session?.user?.id), // Pass userId to getCartItems
    refetchOnWindowFocus: true,
  });

  const queryClient = useQueryClient();

  const totalItems = cartItems.reduce(
    (total, item) => total + item.cantidad,
    0
  );
  const subtotal = cartItems.reduce(
    (total, item) => total + item.cantidad * item.variacion.producto.precio,
    0
  );

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const upd = await updateCartItemQuantity(itemId, newQuantity);
    if (upd.success) {
      toast.success("Cantidad actualizada");
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
    } else {
      toast.error("Error al actualizar la cantidad del producto");
    }
  };

  const handleRemove = async (itemId: string) => {
    const del = await removeFromCart(itemId);
    if (del.success) {
      toast.success("Producto eliminado del carrito");
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
    } else {
      toast.error("Error al eliminar el producto del carrito");
    }
  };

  if (isLoading) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Cargando carrito...</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-4">
        <SheetHeader>
          <SheetTitle>Carrito de compras</SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Tu carrito está vacío</p>
            <Link href="/productos" className="mt-4">
              <Button>Ver productos</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            <div className="space-y-4">
              <Separator />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("es-CO")}</span>
              </div>
              <Button className="w-full">Proceder al pago</Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartItem({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: any;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
}) {
  const attributeTexts =
    item.variacion?.atributos
      .map(
        (attr: any) =>
          `${attr.valorAtributo.atributo.nombre}: ${attr.valorAtributo.valor}`
      )
      .join(", ") || "";

  return (
    <div className="flex gap-3">
      <div className="h-20 w-20 overflow-hidden rounded-md bg-muted">
        <Image
          src={item.variacion.producto.imagenPrincipal || "/placeholder.svg"}
          alt={item.variacion.producto.nombre}
          width={80}
          height={80}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex justify-between">
          <Link
            href={`/productos/${item.variacion.producto.id}`}
            className="line-clamp-1 text-sm font-medium hover:underline"
          >
            {item.variacion.producto.nombre}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {attributeTexts && (
          <p className="text-xs text-muted-foreground">{attributeTexts}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-r-none"
              onClick={() => onQuantityChange(item.id, item.cantidad - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="flex h-6 w-8 items-center justify-center border-y text-xs">
              {item.cantidad}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-l-none"
              onClick={() => onQuantityChange(item.id, item.cantidad + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm font-medium">
            $
            {(item.variacion.producto.precio * item.cantidad).toLocaleString(
              "es-CO"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
