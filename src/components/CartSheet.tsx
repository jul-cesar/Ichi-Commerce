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
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

export default async function CartSheet() {
  const cartItems = await getCartItems();
  const totalItems = cartItems.reduce(
    (total, item) => total + item.cantidad,
    0
  );
  const subtotal = cartItems.reduce(
    (total, item) => total + item.cantidad * item.variacion.producto.precio,
    0
  );

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
      <SheetContent className="w-full sm:max-w-md">
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
            <ScrollArea className="h-[65vh] my-4">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

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

// Client component for cart item interactions
("use client");
function CartItem({ item }: { item: any }) {
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateCartItemQuantity(item.id, newQuantity);
  };

  const handleRemove = async () => {
    await removeFromCart(item.id);
  };

  // Format attributes for display
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
          src={item.producto.imagenPrincipal || "/placeholder.svg"}
          alt={item.producto.nombre}
          width={80}
          height={80}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex justify-between">
          <Link
            href={`/productos/${item.producto.id}`}
            className="line-clamp-1 text-sm font-medium hover:underline"
          >
            {item.producto.nombre}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleRemove}
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
              onClick={() => handleQuantityChange(item.cantidad - 1)}
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
              onClick={() => handleQuantityChange(item.cantidad + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm font-medium">
            ${(item.producto.precio * item.cantidad).toLocaleString("es-CO")}
          </p>
        </div>
      </div>
    </div>
  );
}
