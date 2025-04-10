"use client";

import {
  addAttributeValue,
  deleteAttributeOption,
} from "@/components/admin/actions";
import { useConfirmationModal } from "@/components/confirmationModal";
import { EditAttributeValueModal } from "@/components/edit-attribute-value";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Prisma } from "@prisma/client";
import { Plus, Save, Trash, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type AttributeValuesListProps = {
  attributes: Prisma.AtributoVariacionGetPayload<{
    include: {
      OpcionAtributo: true;
    };
  }>[]; // Using any for simplicity
};

export function AttributeValuesList({ attributes }: AttributeValuesListProps) {
  const [editingAttribute, setEditingAttribute] = useState<string | null>(null);
  const [newValues, setNewValues] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { ConfirmationModal, confirm } = useConfirmationModal();

  const handleAddValue = async (attributeId: string) => {
    if (newValues === "") return;

    setIsSubmitting(true);

    try {
      const newVal = addAttributeValue(attributeId, newValues);
      if ((await newVal).error) {
        toast.error("Error al añadir valor");
        return;
      }
      toast.success("Valor añadido correctamente");
      setNewValues("");
      setEditingAttribute(null);
      router.refresh();
    } catch (error) {
      console.error("Error al añadir valor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (attributes?.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-4 text-muted-foreground">
              No hay atributos definidos. Crea atributos primero.
            </p>
            <Button asChild>
              <a
                href="#"
                onClick={() => router.push("/admin/productos/atributos/nuevo")}
              >
                Ir a gestión de atributos
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {attributes?.map((attribute) => (
        <Card key={attribute.id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{attribute.nombre}</h3>
                <p>{attribute.descripcion}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {attribute.OpcionAtributo?.length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      No hay valores definidos
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setEditingAttribute(
                      editingAttribute === attribute.id ? null : attribute.id
                    )
                  }
                >
                  {editingAttribute === attribute.id ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir valor
                    </>
                  )}
                </Button>
              </div>

              {editingAttribute === attribute.id && (
                <div className="flex gap-2">
                  <Input
                    value={newValues}
                    onChange={(e) => setNewValues(e.target.value)}
                    placeholder="Nuevo valor"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleAddValue(attribute.id)}
                    disabled={isSubmitting}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Guardar
                  </Button>
                </div>
              )}

              <div className="grid gap-2">
                {attribute.OpcionAtributo?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay valores definidos para este atributo
                  </p>
                ) : (
                  attribute.OpcionAtributo?.map((value) => (
                    <div
                      key={value.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <span>{value.valor}</span>
                      <div className="flex gap-1">
                        <EditAttributeValueModal value={value} />

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: "Eliminar valor",
                              message:
                                "¿Estás seguro de que deseas eliminar este valor?",
                            });

                            if (confirmed) {
                              try {
                                const result = await deleteAttributeOption(
                                  value.id
                                );
                                if (result.error) {
                                  toast.error("Error al eliminar valor");
                                  return;
                                }
                                toast.success("Valor eliminado correctamente");
                                router.refresh();
                              } catch (error) {
                                console.error(
                                  "Error al eliminar valor:",
                                  error
                                );
                                toast.error("Error al eliminar valor");
                              }
                            }
                          }}
                          className="text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <ConfirmationModal />
    </div>
  );
}
