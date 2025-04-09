"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Prisma } from "@prisma/client";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

type AtributesSelectProps = {
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
  }> | null;
};

const AtributesSelect = ({ product }: AtributesSelectProps) => {
  // Store all attribute names and their possible values
  const [atributos, setAtributos] = useState<string[]>([]);
  const [todasLasOpciones, setTodasLasOpciones] = useState<{
    [key: string]: string[];
  }>({});

  // Store the current selections
  const [selecciones, setSelecciones] = useState<{
    [key: string]: string;
  }>({});

  // Initialize attributes and options when product changes
  useEffect(() => {
    if (!product) return;

    const atributosEncontrados: string[] = [];
    const opcionesPorAtributo: { [key: string]: string[] } = {};

    // Extract all attributes and their values from the product
    product.variaciones.forEach((variacion) => {
      variacion.atributos.forEach((atributo) => {
        const nombreAtributo = atributo.valorAtributo.atributo.nombre;
        const valorAtributo = atributo.valorAtributo.valor;

        if (!atributosEncontrados.includes(nombreAtributo)) {
          atributosEncontrados.push(nombreAtributo);
        }

        if (!opcionesPorAtributo[nombreAtributo]) {
          opcionesPorAtributo[nombreAtributo] = [];
        }

        if (!opcionesPorAtributo[nombreAtributo].includes(valorAtributo)) {
          opcionesPorAtributo[nombreAtributo].push(valorAtributo);
        }
      });
    });

    setAtributos(atributosEncontrados);
    setTodasLasOpciones(opcionesPorAtributo);
  }, [product]);

  // Get available options for a specific attribute based on current selections
  const getOpcionesDisponibles = (atributoActual: string) => {
    if (!product) return [];

    // If no selections are made, all options are available
    if (Object.keys(selecciones).length === 0) {
      return todasLasOpciones[atributoActual] || [];
    }

    // Get all selections except the current attribute
    const otrasSelecciones = { ...selecciones };
    delete otrasSelecciones[atributoActual];

    // If no other selections are made, all options for this attribute are available
    if (Object.keys(otrasSelecciones).length === 0) {
      return todasLasOpciones[atributoActual] || [];
    }

    // Filter variations that match other selections
    const variacionesValidas = product.variaciones.filter((variacion) => {
      // Check if this variation matches all other selected attributes
      return Object.entries(otrasSelecciones).every(
        ([nombreAtributo, valorSeleccionado]) => {
          return variacion.atributos.some(
            (atributo) =>
              atributo.valorAtributo.atributo.nombre === nombreAtributo &&
              atributo.valorAtributo.valor === valorSeleccionado
          );
        }
      );
    });

    // Extract available options for the current attribute from valid variations
    const opcionesDisponibles: string[] = [];
    variacionesValidas.forEach((variacion) => {
      variacion.atributos.forEach((atributo) => {
        if (atributo.valorAtributo.atributo.nombre === atributoActual) {
          const valor = atributo.valorAtributo.valor;
          if (!opcionesDisponibles.includes(valor)) {
            opcionesDisponibles.push(valor);
          }
        }
      });
    });

    return opcionesDisponibles;
  };

  // Handle selection change for an attribute
  const handleSeleccion = (nombreAtributo: string, valor: string) => {
    const nuevasSelecciones = { ...selecciones };

    if (valor === selecciones[nombreAtributo]) {
      // If clicking the same value, deselect it
      delete nuevasSelecciones[nombreAtributo];
    } else {
      nuevasSelecciones[nombreAtributo] = valor;
    }

    setSelecciones(nuevasSelecciones);
  };

  // Reset all selections
  const resetSelecciones = () => {
    setSelecciones({});
  };

  // Check if a color name is a valid CSS color
  const isValidColor = (color: string): boolean => {
    const lowerColor = color.toLowerCase();
    const basicColors = [
      "black",
      "white",
      "red",
      "green",
      "blue",
      "yellow",
      "purple",
      "orange",
      "pink",
      "brown",
      "gray",
      "grey",
      "cyan",
      "magenta",
    ];

    return basicColors.includes(lowerColor);
  };

  // Get background color for color chips
  const getColorBackground = (color: string): string => {
    if (isValidColor(color)) {
      return color.toLowerCase();
    }

    // Map Spanish color names to English if needed
    const colorMap: Record<string, string> = {
      negro: "black",
      blanco: "white",
      rojo: "red",
      verde: "green",
      azul: "blue",
      amarillo: "yellow",
      morado: "purple",
      naranja: "orange",
      rosa: "pink",
      marron: "brown",
      gris: "gray",
    };

    if (colorMap[color.toLowerCase()]) {
      return colorMap[color.toLowerCase()];
    }

    // Default to a gradient for unknown colors
    return "linear-gradient(to right, #f6d365 0%, #fda085 100%)";
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        {/* Selected attributes display */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(selecciones).map(([atributo, valor]) => (
            <Badge
              key={`${atributo}-${valor}`}
              variant="outline"
              className="px-3 py-1"
            >
              {atributo}: {valor}
              <X
                className="ml-2 h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newSelecciones = { ...selecciones };
                  delete newSelecciones[atributo];
                  setSelecciones(newSelecciones);
                }}
              />
            </Badge>
          ))}
          {Object.keys(selecciones).length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSelecciones}
              className="h-7 px-2 text-xs"
            >
              Limpiar todo
            </Button>
          )}
        </div>

        {/* Attributes selection */}
        {atributos.map((nombreAtributo) => {
          const opcionesDisponibles = getOpcionesDisponibles(nombreAtributo);
          const todasLasOpcionesAtributo =
            todasLasOpciones[nombreAtributo] || [];
          const esColor = nombreAtributo.toLowerCase().includes("color");

          return (
            <div key={nombreAtributo} className="mb-6">
              <h3 className="text-sm font-medium mb-3">{nombreAtributo}</h3>

              <div
                className={cn(
                  "flex flex-wrap gap-2",
                  esColor ? "gap-3" : "gap-2"
                )}
              >
                {todasLasOpcionesAtributo.map((valorOpcion) => {
                  const estaDisponible =
                    opcionesDisponibles.includes(valorOpcion);
                  const estaSeleccionado =
                    selecciones[nombreAtributo] === valorOpcion;

                  if (esColor) {
                    // Render color options as color chips
                    return (
                      <button
                        key={valorOpcion}
                        onClick={() =>
                          estaDisponible &&
                          handleSeleccion(nombreAtributo, valorOpcion)
                        }
                        disabled={!estaDisponible}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                          estaSeleccionado
                            ? "border-black dark:border-white scale-110"
                            : "border-transparent",
                          !estaDisponible && "opacity-30 cursor-not-allowed"
                        )}
                        style={{
                          background: getColorBackground(valorOpcion),
                        }}
                        title={valorOpcion}
                      >
                        {estaSeleccionado && (
                          <Check
                            className={cn(
                              "h-5 w-5",
                              [
                                "white",
                                "yellow",
                                "blanco",
                                "amarillo",
                              ].includes(valorOpcion.toLowerCase())
                                ? "text-black"
                                : "text-white"
                            )}
                          />
                        )}
                      </button>
                    );
                  } else {
                    // Render other attributes as buttons/chips
                    return (
                      <button
                        key={valorOpcion}
                        onClick={() =>
                          estaDisponible &&
                          handleSeleccion(nombreAtributo, valorOpcion)
                        }
                        disabled={!estaDisponible}
                        className={cn(
                          "px-3 py-1.5 rounded-md border transition-all",
                          estaSeleccionado
                            ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                          !estaDisponible && "opacity-30 cursor-not-allowed"
                        )}
                      >
                        {valorOpcion}
                      </button>
                    );
                  }
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AtributesSelect;
