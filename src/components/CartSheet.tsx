"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, X } from "lucide-react";
import Image from "next/image";

export default function CartSheet() {
  const cartItemCount = 1; // This would be dynamic in a real application

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {cartItemCount}
            </Badge>
          )}
          <span className="sr-only">Carrito de compras</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[350px] sm:w-[450px] p-4 ">
        <SheetHeader>
          <SheetTitle>Tu Carrito</SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-md border">
              <Image
                src="/placeholder.svg?height=80&width=80"
                alt="Producto de ejemplo"
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <h3 className="font-medium">Camiseta Premium</h3>
              <p className="text-sm text-muted-foreground">
                Talla: M | Color: Negro
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm">Cantidad: 1</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                  >
                    <span>-</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                  >
                    <span>+</span>
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-medium">$29.99</span>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <X className="h-4 w-4" />
                <span className="sr-only">Eliminar</span>
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-medium">Subtotal</span>
            <span className="font-medium">$29.99</span>
          </div>
          <Button className="mt-4 w-full">Finalizar Compra</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
