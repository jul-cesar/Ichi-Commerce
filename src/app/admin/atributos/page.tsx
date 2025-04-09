import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { prisma } from "../../../../db/instance";
import { AttributeValuesList } from "./components/attribute-values-list";
import { AttributesList } from "./components/attributes-list";

export const dynamic = "force-dynamic";

export default async function AttributesPage() {
  const attributes = await prisma.atributoVariacion.findMany({
    include: {
      OpcionAtributo: true,
    },
  });

  console.log(attributes);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/productos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Gestión de Atributos
        </h1>
      </div>

      <Tabs defaultValue="attributes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attributes">Atributos</TabsTrigger>
          <TabsTrigger value="values">Valores de Atributos</TabsTrigger>
        </TabsList>

        <TabsContent value="attributes" className="space-y-4">
          <div className="flex justify-between">
            <p className="text-muted-foreground">
              Gestiona los tipos de atributos para tus productos
            </p>
            <Button asChild>
              <Link href="/admin/productos/atributos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Atributo
              </Link>
            </Button>
          </div>

          <AttributesList attributes={attributes} />
        </TabsContent>

        <TabsContent value="values" className="space-y-4">
          <div className="flex justify-between">
            <p className="text-muted-foreground">
              Gestiona los valores disponibles para cada atributo
            </p>
          </div>

          <AttributeValuesList attributes={attributes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
