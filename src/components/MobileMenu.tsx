"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";

export default function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left text-xl font-bold">ICHI</SheetTitle>
        </SheetHeader>
        <div className="mt-8 px-1">
          <Input
            type="search"
            placeholder="Buscar productos..."
            className="w-full rounded-md"
          />
        </div>
        <nav className="mt-6 flex flex-col gap-4">
          <Link
            href="/"
            className="flex h-10 items-center rounded-md px-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            Inicio
          </Link>
          <Link
            href="/productos"
            className="flex h-10 items-center rounded-md px-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            Productos
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
