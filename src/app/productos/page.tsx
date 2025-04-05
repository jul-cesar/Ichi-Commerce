import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import Image from "next/image";

// Example products data
const products = [
  {
    id: "1",
    name: "Camiseta Básica Algodón",
    price: 49900,
    image: "/examples/camiseta.jpg",
    stock: 25,
    category: "Camisetas",
  },
  {
    id: "2",
    name: "Jeans Slim Fit",
    price: 129900,
    image: "/examples/pants.jpg",
    stock: 12,
    category: "Pantalones",
  },
  {
    id: "3",
    name: "Vestido Casual Verano",
    price: 89900,
    image: "/examples/dress.jpg",
    stock: 8,
    category: "Vestidos",
  },
  {
    id: "4",
    name: "Zapatillas Urbanas",
    price: 159900,
    image: "/examples/shoes.jpg",
    stock: 4,
    category: "Calzado",
  },
  {
    id: "5",
    name: "Reloj Minimalista",
    price: 199900,
    image: "/examples/ring.jpg",
    stock: 3,
    category: "Accesorios",
  },
  {
    id: "6",
    name: "Chaqueta Denim",
    price: 179900,
    image: "/examples/shirt.jpg",
    stock: 0,
    category: "Camisetas",
  },
  {
    id: "7",
    name: "Bufanda de Lana",
    price: 45900,
    image: "/examples/ring.jpg",
    stock: 15,
    category: "Accesorios",
  },
  {
    id: "8",
    name: "Pantalón Chino",
    price: 99900,
    image: "/examples/pants.jpg",
    stock: 7,
    category: "Pantalones",
  },
];

export default function ProductsPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Banner Section */}
      <section className="relative h-[200px] md:h-[300px] overflow-hidden">
        <Image
          src="/bannerProducts.jpg"
          alt="Colección nueva temporada"
          fill
          className="object-cover"
          priority
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
      <ProductFilters />

      {/* Products Grid */}
      <section className="container p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              stock={product.stock}
              category={product.category}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
