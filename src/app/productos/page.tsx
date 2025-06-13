import ProductCard from "@/components/ProductCard";
import { prisma } from "../../../db/instance";

export const dynamic = "force-dynamic"; // Enable dynamic rendering for this page

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const products = await prisma.producto.findMany({
    where: {
      nombre: {
        contains: searchParams.q || "", // Filter products by name based on search query
      },
    },
    include: {
      categoria: true,
    },
  });

  const categories = await prisma.categoria.findMany({});
  return (
    <main className="flex min-h-screen flex-col">
      {/* Banner Section */}
      <section className="relative h-[200px] md:h-[300px] overflow-hidden">
        <img
          src="/bannerProducts.jpg"
          alt="Colección nueva temporada"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Nueva Colección</h1>
            <p className="text-sm md:text-base max-w-md mx-auto font-semibold">
              Descubre las últimas tendencias en moda con nuestra colección de
              temporada
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      {/* <ProductFilters categories={categories} /> */}

      {/* Products Grid */}
      <section className="container p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products?.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.nombre}
              price={product.precio}
              image={product.imagenPrincipal ?? ""}
              category={product.categoria.nombre}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
