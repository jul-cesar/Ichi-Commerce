import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Example products data - in a real app, this would come from a database
const products = [
  {
    id: "1",
    name: "Camiseta Básica Algodón",
    price: 49900,
    image: "/examples/camiseta.jpg",
    stock: 25,
    category: "Camisetas",
    description:
      "Camiseta básica de algodón 100% orgánico. Corte regular y cuello redondo. Perfecta para el día a día.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro", "Blanco", "Gris", "Azul"],
  },
  {
    id: "2",
    name: "Jeans Slim Fit",
    price: 129900,
    image: "/examples/pants.jpg",
    stock: 12,
    category: "Pantalones",
    description:
      "Jeans de corte slim con 5 bolsillos. Elaborados con algodón y elastano para mayor comodidad y ajuste.",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Azul oscuro", "Azul claro", "Negro"],
  },
  // Other products would be here
];

export default function ProductPage({ params }: { params: { id: string } }) {
  // Find the product with the matching ID
  const product = products.find((p) => p.id === params.id) || products[0];

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container p-6">
        <Link
          href="/productos"
          className="inline-flex items-center text-sm mb-6 hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a productos
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {product.category}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-2xl font-semibold">
                ${product.price.toLocaleString("es-CO")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {product.stock > 0
                  ? `${product.stock} disponibles`
                  : "Sin stock"}
              </p>
            </div>

            <Separator className="my-6" />

            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Descripción</h3>
                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-3">Talla</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      className="rounded-md"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <Button
                      key={color}
                      variant="outline"
                      size="sm"
                      className="rounded-md"
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Cantidad</h3>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-r-none"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex h-8 w-12 items-center justify-center border-y">
                    1
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-l-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button className="w-full" size="lg">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Añadir al carrito
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
