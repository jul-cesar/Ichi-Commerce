"use client";

import { deleteCategorie } from "@/components/admin/actions";
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
import { Loader2, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EditCategorieModal } from "./edit-categorie-modal";

type CategoriesListProps = {
  categories: Prisma.CategoriaGetPayload<{
    include: {
      productos: true;
    };
  }>[];
};

export function CategoriesList({ categories }: CategoriesListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDeleteClick = async () => {
    try {
      setLoading(true);
      const del = await deleteCategorie(attributeToDelete.id);
      if (!del) {
        toast.error(`Error al eliminar el atributo`);
        setLoading(false);
        setDeleteDialogOpen(false);
        return;
      } else {
        setLoading(false);
        setDeleteDialogOpen(false);
        toast.success("Atributo eliminado correctamente");

        setAttributeToDelete(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Error al eliminar el atributo:", error);
      toast.error("Error al eliminar el atributo");
      setLoading(false);
    }

    setDeleteDialogOpen(true);
  };

  if (categories?.length === 0) {
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
      {categories.map((attribute) => (
        <Card key={attribute.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{attribute.nombre}</h3>
                <p>{attribute.descripcion}</p>
              </div>
              <div className="flex gap-2">
                <EditCategorieModal categorie={attribute}/>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                  onClick={() => {
                    setAttributeToDelete(attribute);
                    setDeleteDialogOpen(true);
                  }}
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
              la categoria
              <span className="font-semibold">
                {" "}
                {attributeToDelete?.nombre}{" "}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteClick}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
