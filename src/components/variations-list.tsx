"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Prisma } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Delete, Edit, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteVariacion, getAttributes } from "./admin/actions";
import { AddVariationModal } from "./admin/add-variations";
import { EditVariationModal } from "./admin/EditVariationModal";
import { useConfirmationModal } from "./confirmationModal";

type VariationsListProps = {
  product: Prisma.ProductoGetPayload<{
    include: {
      variaciones: {
        include: {
          atributos: {
            include: {
              valorAtributo: {
                include: {
                  atributo: true; // Include the Atributo model
                };
              };
            };
          };
        };
      };
    };
  }>; // Using any for simplicity, but you should define a proper type
};

export function VariationsList({ product }: VariationsListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { confirm, ConfirmationModal } = useConfirmationModal();

  const { data: attributesList } = useQuery({
    queryFn: async () => await getAttributes(),
    queryKey: ["attributes"],
  });

  // Group attributes by type for better display
  const groupAttributesByType = (
    variation: Prisma.VariacionProductoGetPayload<{
      include: {
        atributos: {
          include: {
            valorAtributo: {
              include: {
                atributo: {
                  include: {
                    OpcionAtributo: true; // Include the OpcionAtributo model if needed
                  };
                };
              };
            };
          };
        };
      };
    }>
  ) => {
    const grouped: Record<string, string> = {};

    variation.atributos.forEach((atributo) => {
      const nombreAtributo = atributo.valorAtributo.atributo.nombre;
      grouped[nombreAtributo] = atributo.valorAtributo.valor;
    });

    return grouped;
  };

  if (product.variaciones.length === 0) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">No hay variaciones</span>
        <AddVariationModal attributes={attributesList} productId={product.id}>
          <Button variant="outline" size="sm" asChild>
            <Plus className="h-3 w-3 mr-1" />
            Añadir
          </Button>
        </AddVariationModal>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">
            {product.variaciones.length} variaciones
          </span>
        </div>
        <div className="flex gap-2">
          <AddVariationModal attributes={attributesList} productId={product.id}>
            <Button variant="outline" size="sm" asChild>
              <Plus className="h-3 w-3 mr-1" />
              Añadir
            </Button>
          </AddVariationModal>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className="mt-2 space-y-2">
        {product.variaciones.map((variation) => {
          const attributes = groupAttributesByType(variation);

          return (
            <div
              key={variation.id}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(attributes).map(([name, value]) => (
                    <Badge
                      key={`${name}-${value}`}
                      variant="outline"
                      className="mr-1"
                    >
                      {name}: {value}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm">
                  <span
                    className={
                      variation.stock > 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    Stock: {variation.stock}
                  </span>
                  {/* {variation. && (
                    <span className="ml-4">
                      Precio: ${variation.precio.toLocaleString("es-CO")}
                    </span>
                  )} */}
                </div>
              </div>
              <EditVariationModal
                attributes={attributesList}
                trigger={
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar variación</span>
                  </Button>
                }
                variation={variation}
                productId={product.id}
              ></EditVariationModal>

              <Button
                variant="destructive"
                size="icon"
                className="ml-2"
                onClick={async () => {
                  if (
                    await confirm({
                      message:
                        "¿Estás seguro de que deseas eliminar esta variación?",
                    })
                  ) {
                    const result = await deleteVariacion(variation.id);
                    if (result.success) {
                      toast("Variación eliminada correctamente.");
                      router.refresh();
                    } else {
                      toast(result.error || "Error al eliminar la variación.");
                    }
                  }
                }}
              >
                <Delete />
                <span className="sr-only">Eliminar variación</span>
              </Button>
            </div>
          );
        })}
        <ConfirmationModal />
      </CollapsibleContent>
    </Collapsible>
  );
}
