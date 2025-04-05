"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState } from "react";

export default function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Example search suggestions - in a real app, these would be dynamic
  const suggestions = [
    "Camisetas",
    "Pantalones",
    "Vestidos",
    "Accesorios",
    "Ofertas",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
          <span className="sr-only">Buscar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0" title="busqueda">
        <div className="flex items-center p-4 border-b">
          <Search className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="flex-shrink-0"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Sugerencias
          </h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery(suggestion)}
                className="rounded-full"
              >
                {suggestion}
              </Button>
            ))}
          </div>

          {searchQuery && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">
                Resultados para "{searchQuery}"
              </h3>
              <div className="text-center py-8 text-muted-foreground">
                <p>Ingresa tu búsqueda para ver resultados</p>
                <Button className="mt-4">Buscar "{searchQuery}"</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
