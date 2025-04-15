"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter(); // Initialize the router

  // Example search suggestions - in a real app, these would be dynamic
  const suggestions = [
    "Camisetas",
    "Pantalones",
    "Vestidos",
    "Accesorios",
    "Ofertas",
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/productos?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false); // Close the dialog after redirecting
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
          <span className="sr-only">Buscar</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] p-0 gap-0" title="busqueda">
        <DialogTitle className="p-4">Busca productos</DialogTitle>
        <div className="flex items-center p-4 border-b">
          <Search className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder="Buscar productos..."
            className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()} // Trigger search on Enter key
            autoFocus
          />
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
                onClick={() => {
                  setSearchQuery(suggestion);
                  router.push(`/productos?q=${encodeURIComponent(suggestion)}`);
                  setIsOpen(false); // Close the dialog after redirecting
                }}
                className="rounded-full"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
