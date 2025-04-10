import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "../../db/instance";

export default async function HomePage() {
  const featuredProducts = await prisma.producto.findMany({
    include: {
      categoria: true,
    },
    take: 4, // Limit to 4 products for featured section
  });

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Banner */}
      <section className="relative h-[80vh] overflow-hidden">
        <Image
          src="/bannermain.jpg"
          alt="Calzado de calidad - Envío gratis"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/60 flex items-center p-6">
          <div className="container">
            <div className="max-w-xl space-y-5 text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Calzado colombiano de calidad
              </h1>
              <p className="text-lg md:text-xl">
                Estilo y comodidad en cada paso. Paga al recibir y disfruta de
                envío gratis a toda Colombia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                  asChild
                >
                  <Link href="/productos">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Ver colección
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white hover:text-black"
                >
                  Novedades
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Highlighted */}
      <section className="py-12 bg-primary/5 p-4">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              Compra con total confianza
            </h2>
            <p className="text-muted-foreground mt-2">
              Beneficios exclusivos para nuestros clientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Truck className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Envío Gratis</h3>
                <p className="text-sm text-muted-foreground">
                  A toda Colombia en todos tus pedidos, sin monto mínimo de
                  compra
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Package className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Pago Contraentrega</h3>
                <p className="text-sm text-muted-foreground">
                  Paga cuando recibas tu pedido, sin anticipos ni pagos en línea
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Entrega Rápida</h3>
                <p className="text-sm text-muted-foreground">
                  Recibe tu pedido en 2-5 días hábiles dependiendo de tu
                  ubicación
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-7 w-7 text-primary" />
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

      {/* Collection Highlight */}
      <section className="py-16 p-4">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Nueva colección de temporada
                </h2>
                <p className="text-muted-foreground">
                  Descubre nuestra nueva colección de calzado diseñada para
                  combinar estilo, comodidad y durabilidad. Fabricados con los
                  mejores materiales y con el sello de calidad colombiana.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Materiales premium</h3>
                    <p className="text-sm text-muted-foreground">
                      Cuero genuino y materiales de alta calidad para mayor
                      durabilidad
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Diseño ergonómico</h3>
                    <p className="text-sm text-muted-foreground">
                      Plantillas anatómicas que se adaptan a tu pie para mayor
                      comodidad
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Estilo versátil</h3>
                    <p className="text-sm text-muted-foreground">
                      Diseños que combinan con cualquier ocasión, desde casual
                      hasta formal
                    </p>
                  </div>
                </div>
              </div>
              <Button size="lg" className="mt-2" asChild>
                <Link href="/productos">Ver colección completa</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
                <Image
                  src="/shoes-collection-1.jpg"
                  alt="Zapatos de temporada"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-[3/4] relative rounded-lg overflow-hidden mt-8">
                <Image
                  src="/shoes-collection-2.jpg"
                  alt="Zapatos de temporada"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30 p-4">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Productos Destacados
              </h2>
              <p className="text-muted-foreground mt-1">
                Nuestros modelos más vendidos y mejor valorados
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
                name={product.nombre}
                price={product.precio}
                image={product.imagenPrincipal || "/placeholder-shoe.jpg"}
                category={product.categoria.nombre}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 p-4">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[450px] rounded-lg overflow-hidden">
              <Image
                src="/bannerProducts.jpg"
                alt="Calzado colombiano de calidad"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">
                Calzado colombiano con identidad
              </h2>
              <p className="text-muted-foreground">
                Creemos que el buen calzado debe ser accesible para todos. Por
                eso, hemos creado un modelo de negocio que elimina las barreras
                tradicionales del comercio electrónico, permitiéndote pagar al
                recibir tu pedido.
              </p>
              <p className="text-muted-foreground">
                Nuestros zapatos son diseñados y fabricados en Colombia,
                apoyando el talento y la industria local. Cada par refleja la
                calidad, el confort y el estilo que nos caracteriza.
              </p>
              <div className="pt-4 space-y-4">
                <h3 className="text-xl font-medium">Cobertura nacional</h3>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Envíos a toda Colombia sin costo adicional</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span>
                    Pago contraentrega en todas las ciudades principales
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}

      {/* Call to Action */}
      <section className="py-12 bg-muted/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              ¿Listo para estrenar?
            </h2>
            <p className="text-muted-foreground">
              Explora nuestra colección completa y encuentra el calzado perfecto
              para cada ocasión
            </p>
            <Button size="lg" asChild>
              <Link href="/productos">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Ver todos los productos
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
