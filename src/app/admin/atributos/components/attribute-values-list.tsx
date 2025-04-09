"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Save, Trash, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AttributeValuesListProps = {
  attributes: any[]; // Using any for simplicity
};

export function AttributeValuesList({ attributes }: AttributeValuesListProps) {
  const [editingAttribute, setEditingAttribute] = useState<string | null>(null);
  const [newValues, setNewValues] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAddValue = async (attributeId: string) => {
    if (!newValues[attributeId] || newValues[attributeId].trim() === "") return;

    setIsSubmitting(true);

    try {
      // Implement your API call here
      // Example:
      // await fetch(`/api/atributos/${attributeId}/valores`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ valor: newValues[attributeId] }),
      // });

      // Reset state and refresh
      setNewValues({ ...newValues, [attributeId]: "" });
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
                    value={newValues[attribute.id] || ""}
                    onChange={(e) =>
                      setNewValues({
                        ...newValues,
                        [attribute.id]: e.target.value,
                      })
                    }
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
                {attribute.valores?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay valores definidos para este atributo
                  </p>
                ) : (
                  attribute.valores?.map((value: any) => (
                    <div
                      key={value.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <span>{value.valor}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
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
    </div>
  );
}
