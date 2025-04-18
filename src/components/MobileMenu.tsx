"use client";

import { Home, MenuIcon, ShieldUser } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/client";

export default function MobileMenu() {
  const [openCategories, setOpenCategories] = useState<string[]>([]);

    const { data: session } = authClient.useSession();

  const toggleCategory = (category: string) => {
    if (openCategories.includes(category)) {
      setOpenCategories(openCategories.filter((c) => c !== category));
    } else {
      setOpenCategories([...openCategories, category]);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] sm:w-[400px] p-0 overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-6">
          <SheetHeader>
            <SheetTitle className="text-left text-2xl font-bold text-white">
              CH GROUP
            </SheetTitle>
          </SheetHeader>
        </div>
        {/* 
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="w-full rounded-full pl-10 border-rose-200 focus-visible:ring-rose-400"
            />
          </div>
        </div> */}

        <div className="px-2">
          {/* <div className="flex items-center justify-between p-2">
            <Link
              href="/cuenta"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <User className="h-4 w-4" />
              Mi Cuenta
            </Link>
            <Link
              href="/favoritos"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Heart className="h-4 w-4" />
              Favoritos
            </Link>
          </div> */}
          {/* 
          <div className="bg-muted/30 rounded-lg p-3 my-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-rose-500" />
              <span className="font-medium">Mi Carrito</span>
            </div>
            <Badge
              variant="secondary"
              className="bg-rose-100 text-rose-700 hover:bg-rose-200"
            >
              3 items
            </Badge>
          </div> */}
        </div>

        <Separator className="my-2" />

        {session?.user.role === "admin" && (
          <Link href="/admin" className="hidden md:flex gap-2 hover:underline">
            <ShieldUser /> Admin
          </Link>
        )}

        <nav className="px-2">
          <Link
            href="/"
            className="flex h-12 items-center rounded-md px-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Home className="mr-3 h-4 w-4" />
            Inicio
          </Link>
          <Link
            href="/productos"
            className="flex h-12 items-center rounded-md px-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Home className="mr-3 h-4 w-4" />
            Productos
          </Link>

          {/* <Collapsible
            open={openCategories.includes("productos")}
            onOpenChange={() => toggleCategory("productos")}
          >
            <CollapsibleTrigger className="flex h-12 w-full items-center justify-between rounded-md px-4 text-sm font-medium transition-colors hover:bg-accent">
              <div className="flex items-center">
                <ShoppingBag className="mr-3 h-4 w-4" />
                Productos
              </div>
              {openCategories.includes("productos") ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-7 border-l pl-4 py-2 space-y-2">
                <Link
                  href="/productos/ropa"
                  className="flex h-10 items-center rounded-md px-4 text-sm transition-colors hover:bg-accent"
                >
                  Ropa
                </Link>
                <Link
                  href="/productos/accesorios"
                  className="flex h-10 items-center rounded-md px-4 text-sm transition-colors hover:bg-accent"
                >
                  Accesorios
                </Link>
                <Link
                  href="/productos/calzado"
                  className="flex h-10 items-center rounded-md px-4 text-sm transition-colors hover:bg-accent"
                >
                  Calzado
                </Link>
                <Link
                  href="/productos/nuevos"
                  className="flex h-10 items-center rounded-md px-4 text-sm font-medium text-rose-500 transition-colors hover:bg-accent"
                >
                  Nuevos Lanzamientos
                </Link>
              </div>
            </CollapsibleContent>
          </Collapsible> */}
          {/* 
          <Collapsible
            open={openCategories.includes("ofertas")}
            onOpenChange={() => toggleCategory("ofertas")}
          >
            <CollapsibleTrigger className="flex h-12 w-full items-center justify-between rounded-md px-4 text-sm font-medium transition-colors hover:bg-accent">
              <div className="flex items-center">
                <Badge
                  variant="outline"
                  className="mr-3 bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200"
                >
                  %
                </Badge>
                Ofertas
              </div>
              {openCategories.includes("ofertas") ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-7 border-l pl-4 py-2 space-y-2">
                <Link
                  href="/ofertas/semana"
                  className="flex h-10 items-center rounded-md px-4 text-sm transition-colors hover:bg-accent"
                >
                  Ofertas de la Semana
                </Link>
                <Link
                  href="/ofertas/temporada"
                  className="flex h-10 items-center rounded-md px-4 text-sm transition-colors hover:bg-accent"
                >
                  Rebajas de Temporada
                </Link>
              </div>
            </CollapsibleContent>
          </Collapsible> */}

          {/* <Link
            href="/contacto"
            className="flex h-12 items-center rounded-md px-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            <svg
              className="mr-3 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            Contacto
          </Link> */}
        </nav>

        <Separator className="my-4" />

        {/* <div className="px-6 pb-6">
          <p className="text-sm text-muted-foreground mb-3">Síguenos en:</p>
          <div className="flex space-x-4">
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div> */}
      </SheetContent>
    </Sheet>
  );
}
