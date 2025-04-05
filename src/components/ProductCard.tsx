import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  category: string;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  stock,
  category,
}: ProductCardProps) {
  return (
    <Link
      href={`/productos/${id}`}
      className="group relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden rounded-md bg-muted">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          width={500}
          height={500}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {stock < 5 && stock > 0 && (
        <Badge variant="secondary" className="absolute right-3 top-3">
          ¡Últimas unidades!
        </Badge>
      )}

      {stock === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Badge variant="destructive" className="text-sm">
            Agotado
          </Badge>
        </div>
      )}

      <div className="mt-3 space-y-1 px-1">
        <h3 className="font-medium leading-tight">{name}</h3>
        <p className="text-sm text-muted-foreground">{category}</p>
        <div className="flex items-center justify-between">
          <p className="font-medium">${price.toLocaleString("es-CO")}</p>
          <p className="text-xs text-muted-foreground">
            {stock > 0 ? `${stock} disponibles` : "Sin stock"}
          </p>
        </div>
      </div>
    </Link>
  );
}
