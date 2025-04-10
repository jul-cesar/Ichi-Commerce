"use client";

import { deleteAttribute } from "@/components/admin/actions";
import { EditAttributeModal } from "@/components/admin/edit-attribute-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Prisma } from "@prisma/client";
import { Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type AttributesListProps = {
  attributes: Prisma.AtributoVariacionGetPayload<{
    include: {
      OpcionAtributo: true;
    };
  }>[];
};

export function AttributesList({ attributes }: AttributesListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<any>(null);
  const router = useRouter();

  const handleDeleteClick = async (
    attribute: Prisma.AtributoVariacionGetPayload<{}>
  ) => {
    const del = await deleteAttribute(attribute.id);

    if (del.error) {
      toast.error(`Error al eliminar el atributo ${del.error}`);
    }
    toast.success("Atributo eliminado correctamente");
    setAttributeToDelete(attribute);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!attributeToDelete) return;

    try {
      // Implement your delete logic here
      // Example:
      // await fetch(`/api/atributos/${attributeToDelete.id}`, { method: 'DELETE' });

      // Close dialog and refresh
      setDeleteDialogOpen(false);
      setAttributeToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Error al eliminar el atributo:", error);
    }
  };

  if (attributes?.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-4 text-muted-foreground">
              No hay atributos definidos
            </p>
            <Button asChild>
              <Link href="/admin/productos/atributos/nuevo">
                Crear primer atributo
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {attributes.map((attribute) => (
        <Card key={attribute.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{attribute.nombre}</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {attribute.OpcionAtributo.map((value: any) => (
                    <Badge key={value.id} variant="outline">
                      {value.valor}
                    </Badge>
                  ))}
                  {attribute.OpcionAtributo?.length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      No hay valores definidos
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <EditAttributeModal attribute={attribute} />

                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDeleteClick(attribute)}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el atributo
              <span className="font-semibold">
                {" "}
                {attributeToDelete?.nombre}{" "}
              </span>
              y todos sus valores asociados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
