import { notFound } from "next/navigation";
import { prisma } from "../../../../../db/instance";
import { EditProductForm } from "./edit-product-form";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const productId = params.id;

  // Obtener el producto y las categorías
  const [product, categories] = await Promise.all([
    prisma.producto.findUnique({
      where: { id: productId },
      include: {
        categoria: true,
      },
    }),
    prisma.categoria.findMany({
      orderBy: { nombre: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Editar Producto</h1>
      <EditProductForm product={product} categories={categories} />
    </div>
  );
}
