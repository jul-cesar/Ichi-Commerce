import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "../../../../db/instance";
import { AddCategorieModal } from "./add-categorie-modal";
import { CategoriesList } from "./categoriesList";

export const dynamic = "force-dynamic";

export default async function AttributesPage() {
  const categories = await prisma.categoria.findMany({
    include: {
      productos: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/productos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Gestión de Categorias
        </h1>
      </div>

      <div className="flex justify-between">
        <p className="text-muted-foreground">
          Gestiona las categorias para tus productos
        </p>
        <AddCategorieModal />
      </div>

      <CategoriesList categories={categories} />
    </div>
  );
}
