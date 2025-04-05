import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Featured products data
const featuredProducts = [
  {
    id: "1",
    name: "Camiseta Básica Algodón",
    price: 49900,
    image: "/examples/camiseta.jpg",
    stock: 25,
    category: "Camisetas",
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
    id: "5",
    name: "Reloj Minimalista",
    price: 199900,
    image: "/examples/ring.jpg",
    stock: 3,
    category: "Accesorios",
  },
  {
    id: "4",
    name: "Zapatillas Urbanas",
    price: 159900,
    image: "/examples/shoes.jpg",
    stock: 4,
    category: "Calzado",
  },
];

// Testimonials data
const testimonials = [
  {
    name: "Carolina Ramírez",
    location: "Bogotá",
    content:
      "Excelente servicio y la opción de pago contraentrega me da mucha confianza. Los productos son de muy buena calidad.",
    rating: 5,
  },
  {
    name: "Andrés Martínez",
    location: "Medellín",
    content:
      "Me encanta que pueda recibir mis pedidos sin costo adicional. La ropa es exactamente como se ve en las fotos.",
    rating: 5,
  },
  {
    name: "Valentina Torres",
    location: "Cali",
    content:
      "El envío llegó antes de lo esperado y el proceso de pago contraentrega fue muy sencillo. Definitivamente volveré a comprar.",
    rating: 4,
  },
];

export default function HomePage() {
  return (
    <main className=" flex min-h-screen flex-col">
      {/* Hero Banner */}
      <section className="relative h-[70vh] overflow-hidden">
        <Image
          src="/bannermain.jpg"
          alt="ICHI - Moda colombiana"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50 flex items-center p-6">
          <div className="container">
            <div className="max-w-xl space-y-5 text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Moda colombiana a tu puerta
              </h1>
              <p className="text-lg md:text-xl">
                Paga al recibir tu pedido y disfruta de envío gratis a toda
                Colombia
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" asChild>
                  <Link href="/productos">Ver productos</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white hover:text-black"
                >
                  Conocer más
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30 p-4">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-sm">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Envío Gratis</h3>
                <p className="text-sm text-muted-foreground">
                  A toda Colombia en todos tus pedidos, sin monto mínimo de
                  compra
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Pago Contraentrega</h3>
                <p className="text-sm text-muted-foreground">
                  Paga cuando recibas tu pedido, sin anticipos ni pagos en línea
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Entrega Rápida</h3>
                <p className="text-sm text-muted-foreground">
                  Recibe tu pedido en 2-5 días hábiles dependiendo de tu
                  ubicación
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Compra Segura</h3>
                <p className="text-sm text-muted-foreground">
                  Garantía de 30 días en todos nuestros productos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 p-4">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Productos Destacados
              </h2>
              <p className="text-muted-foreground mt-1">
                Descubre nuestra selección de productos más populares
              </p>
            </div>
            <Button variant="ghost" className="mt-4 md:mt-0" asChild>
              <Link href="/productos" className="flex items-center">
                Ver todos los productos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
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
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-muted/30 p-4">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/bannerProducts.jpg"
                alt="Sobre ICHI"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">
                Moda colombiana con identidad
              </h2>
              <p className="text-muted-foreground">
                En ICHI creemos que la moda debe ser accesible para todos. Por
                eso, hemos creado un modelo de negocio que elimina las barreras
                tradicionales del comercio electrónico.
              </p>
              <p className="text-muted-foreground">
                Nuestros productos son diseñados y fabricados en Colombia,
                apoyando el talento y la industria local. Cada prenda refleja la
                calidad y el estilo que nos caracteriza.
              </p>
              <div className="pt-4">
                <h3 className="text-xl font-medium mb-4">Cobertura nacional</h3>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Envíos a toda Colombia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Miles de colombianos ya disfrutan de nuestros productos y del
              servicio de pago contraentrega
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonial.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Únete a nuestra comunidad
            </h2>
            <p className="mb-6">
              Suscríbete para recibir noticias sobre nuevas colecciones y
              ofertas exclusivas
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="px-4 py-2 rounded-md flex-1 text-foreground bg-white"
              />
              <Button variant="secondary">Suscribirse</Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
