import AtributesSelect from "@/components/AtributesSelect";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "../../../../db/instance";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  // Find the product with the matching ID
  const product = await prisma.producto.findUnique({
    where: { id: params.id },
    include: {
      categoria: true,
      variaciones: {
        include: {
          atributos: {
            include: {
              valorAtributo: {
                include: {
                  atributo: true, // Incluimos el modelo AtributoVariacion
                },
              },
            },
          },
        },
      },
    },
  });

  if (!product) {
    console.log("producto no encontrado.");
    return;
  }

  type OpcionesPorAtributo = {
    [key: string]: string[]; // Clave: nombre del atributo, Valor: array de opciones
  };

  const opcionesPorAtributo: OpcionesPorAtributo = {};

  product.variaciones.forEach((variacion) => {
    variacion.atributos.forEach((atributo) => {
      const nombreAtributo = atributo.valorAtributo.atributo.nombre; // Accedemos al nombre del atributo
      const valorOpcion = atributo.valorAtributo.valor;

      if (!opcionesPorAtributo[nombreAtributo]) {
        opcionesPorAtributo[nombreAtributo] = [];
      }

      if (!opcionesPorAtributo[nombreAtributo].includes(valorOpcion)) {
        opcionesPorAtributo[nombreAtributo].push(valorOpcion);
      }
    });
  });

  console.log(product);

  let salida = "";
  for (const nombreAtributo in opcionesPorAtributo) {
    salida += `${nombreAtributo}: ${opcionesPorAtributo[nombreAtributo].join(
      ", "
    )}  `;
  }

  const obtenerStockTotalproduct = async (productId: string) => {
    // Obtener todas las variaciones del product
    const variaciones = await prisma.variacionProducto.findMany({
      where: {
        productoId: productId,
      },
      select: {
        stock: true,
      },
    });

    // Sumar el stock de todas las variaciones
    const stockTotal = variaciones.reduce((total, variacion) => {
      return total + variacion.stock;
    }, 0);

    return stockTotal;
  };

  const stock = await obtenerStockTotalproduct(product?.id || "");

  let htmlSalida = "";

  for (const nombreAtributo in opcionesPorAtributo) {
    htmlSalida += `<h1>${nombreAtributo}</h1>`;
    htmlSalida += `<select>`;
    opcionesPorAtributo[nombreAtributo].forEach((valorOpcion) => {
      htmlSalida += `<option value="${valorOpcion}">${valorOpcion}</option>`;
    });
    htmlSalida += `</select><br>`;
  }

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
              src={product?.imagenPrincipal || "/placeholder.svg"}
              alt={product?.nombre ?? ""}
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div>
              <h1 className="text-2xl font-bold">{product?.nombre}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {product?.categoria.nombre}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-2xl font-semibold">
                ${product?.precio.toLocaleString("es-CO")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {stock > 0 ? `${stock} disponibles` : "Sin stock"}
              </p>
            </div>

            <Separator className="my-6" />

            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Descripción</h3>
                <p className="text-sm text-muted-foreground">
                  {product?.descripcion}
                </p>
              </div>
              <AtributesSelect product={product} />
              {/* <div>
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
              </div> */}
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
