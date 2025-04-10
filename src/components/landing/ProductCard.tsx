import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  category,
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden group border-none shadow-sm hover:shadow-md transition-all duration-300">
      <Link href={`/productos/${id}`}>
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={image || "/placeholder-shoe.jpg"}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/80 hover:bg-white">
              {category}
            </Badge>
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/productos/${id}`} className="hover:underline">
          <h3 className="font-medium text-base line-clamp-1">{name}</h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <p className="font-bold text-lg">${price.toLocaleString("es-CO")}</p>
          <Badge
            variant="outline"
            className="text-xs bg-primary/10 text-primary border-primary/20"
          >
            Envío gratis
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" variant="outline" asChild>
          <Link href={`/productos/${id}`}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Ver detalles
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
