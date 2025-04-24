"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

type AtributesSelectProps = {
  product: {
    variaciones: {
      id: string;
      stock: number; // Include stock information
      atributos: {
        valorAtributo: {
          atributo: { nombre: string };
          valor: string;
        };
      }[];
    }[];
  } | null;
  onSelectionChange?: (selecciones: { [key: string]: string }) => void; // Callback to send selected attributes
};

const AtributesSelect = ({
  product,
  onSelectionChange,
}: AtributesSelectProps) => {
  const [atributos, setAtributos] = useState<string[]>([]);
  const [todasLasOpciones, setTodasLasOpciones] = useState<{
    [key: string]: string[];
  }>({});
  const [selecciones, setSelecciones] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (!product || !Array.isArray(product.variaciones)) return; // Ensure variaciones is an array

    const atributosEncontrados: string[] = [];
    const opcionesPorAtributo: { [key: string]: string[] } = {};

    product.variaciones.forEach((variacion) => {
      if (variacion.stock > 0) {
        // Only include variations with stock > 0
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
      }
    });

    // Sort the attribute values alphabetically
    Object.keys(opcionesPorAtributo).forEach((key) => {
      opcionesPorAtributo[key].sort((a, b) => a.localeCompare(b));
    });

    setAtributos(atributosEncontrados);
    setTodasLasOpciones(opcionesPorAtributo);
  }, [product]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selecciones); // Notify parent component of selection changes
    }
  }, [selecciones, onSelectionChange]);

  const getOpcionesDisponibles = (atributoActual: string) => {
    if (!product) return [];

    if (Object.keys(selecciones).length === 0) {
      return todasLasOpciones[atributoActual] || [];
    }

    const otrasSelecciones = { ...selecciones };
    delete otrasSelecciones[atributoActual];

    if (Object.keys(otrasSelecciones).length === 0) {
      return todasLasOpciones[atributoActual] || [];
    }

    const variacionesValidas = product.variaciones.filter((variacion) => {
      return (
        variacion.stock > 0 && // Only include variations with stock > 0
        Object.entries(otrasSelecciones).every(
          ([nombreAtributo, valorSeleccionado]) => {
            return variacion.atributos.some(
              (atributo) =>
                atributo.valorAtributo.atributo.nombre === nombreAtributo &&
                atributo.valorAtributo.valor === valorSeleccionado
            );
          }
        )
      );
    });

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

  const handleSeleccion = (nombreAtributo: string, valor: string) => {
    const nuevasSelecciones = { ...selecciones };

    if (valor === selecciones[nombreAtributo]) {
      delete nuevasSelecciones[nombreAtributo];
    } else {
      nuevasSelecciones[nombreAtributo] = valor;
    }

    setSelecciones(nuevasSelecciones);
  };

  const resetSelecciones = () => {
    setSelecciones({});
  };

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
      "beige",
      "Hueso",
    ];

    return basicColors.includes(lowerColor);
  };

  const getColorBackground = (color: string): string => {
    if (isValidColor(color)) {
      return color.toLowerCase();
    }

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
      beige: "#bbab81", // Correct beige color
      Hueso: "red", // Correct hueso color (light beige)
    };

    if (colorMap[color.toLowerCase()]) {
      return colorMap[color.toLowerCase()];
    }

    return "#c0b7b2";
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
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
