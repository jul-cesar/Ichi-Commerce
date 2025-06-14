import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, ThumbsUp } from "lucide-react";

// ...existing code...

const sandalsReviews = [
  {
    id: 1,
    name: "Sofía Méndez",
    avatar: "/placeholder.svg?height=40&width=40",
    date: "hace 3 días",
    rating: 5,
    verified: true,
    content:
      "¡Estas sandalias son perfectas! Súper cómodas desde el primer día, no me han causado ampollas y el tacón es ideal para usarlas todo el día. El color es exactamente como en la foto.",
    likes: 32,
    images: ["/sandals-review1.jpg"],
  },
  {
    id: 2,
    name: "Mariana Torres",
    avatar: "/placeholder.svg?height=40&width=40",
    date: "hace 1 semana",
    rating: 5,
    verified: true,
    content:
      "Las sandalias son hermosas, la calidad del cuero es excelente y son muy versátiles, me van con todo mi guardarropa. Además el envío fue rápido y llegaron muy bien empacadas.",
    likes: 27,
    images: ["/sandals-review2.jpg", "/sandals-review3.jpg"],
  },
  {
    id: 3,
    name: "Elena Fuentes",
    avatar: "/placeholder.svg?height=40&width=40",
    date: "hace 2 semanas",
    rating: 4,
    verified: true,
    content:
      "Sandalias muy bonitas y cómodas. El diseño es precioso y la calidad excelente.",
    likes: 15,
    images: [],
  },
  {
    id: 4,
    name: "Lucía Domínguez",
    avatar: "/placeholder.svg?height=40&width=40",
    date: "hace 3 semanas",
    rating: 5,
    verified: true,
    content:
      "¡Me encantan estas sandalias! Son elegantes pero a la vez muy cómodas. Perfectas para eventos formales o para salir de noche. Las recomiendo totalmente, son una buena inversión.",
    likes: 41,
    images: ["/sandals-review4.jpg"],
  },
  {
    id: 5,
    name: "Carolina Vega",
    avatar: "/placeholder.svg?height=40&width=40",
    date: "hace 1 mes",
    rating: 5,
    verified: true,
    content:
      "Estas son mis terceras sandalias de esta marca y como siempre, la calidad es espectacular. Son ligeras, cómodas y el acabado es impecable. Además, el sistema de ajuste hace que se adapten perfectamente al pie.",
    likes: 29,
    images: [],
  },
];

// ...existing code...

const reviewsGenerales = [
  {
    id: 1,
    name: "Laura Martínez",
    avatar: "/placeholder.svg?height=40&width=40",
    date: "hace 2 días",
    rating: 5,
    verified: true,
    content:
      "¡Increíble producto! la calidad es excelente. Muy cómodos y el diseño es exactamente como en las fotos. Definitivamente compraré más.",
    likes: 24,
    images: [],
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    avatar: "/placeholder.svg?height=40&width=40",
    date: "hace 1 semana",
    rating: 5,
    verified: true,
    content:
      "Excelente calidad y muy buen precio. El envío fue súper rápido y el producto llegó en perfectas condiciones. Ya es mi segundo par y no será el último.",
    likes: 18,
    images: [],
  },
  {
    id: 3,
    name: "Ana García",
    avatar: "/placeholder.svg?height=40&width=40",
    date: "hace 2 semanas",
    rating: 4,
    verified: true,
    content: "Muy buenos, cómodos y bonitos..",
    likes: 7,
    images: [],
  },
];

export default function ReviewsSection({
  productName,
}: {
  productName: string;
}) {
  console.log("Product Name:", productName);
  // Determine which reviews to show based on the product name
  const reviews =
    productName.trim().toLowerCase() === "sandalias roma"
      ? sandalsReviews
      : reviewsGenerales;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Reseñas de clientes</h2>
        <Badge variant="outline" className="px-2 py-1">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">4.9</span>
            <span className="text-muted-foreground">(196)</span>
          </div>
        </Badge>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={review.avatar || "/placeholder.svg"}
                    alt={review.name}
                  />
                  <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{review.name}</p>
                    {review.verified && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1 py-0 h-5 bg-green-50 text-green-700 border-green-200"
                      >
                        Compra verificada
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span>•</span>
                    <span>{review.date}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm">{review.content}</p>

            {review.images.length > 0 && (
              <div className="flex gap-2 mt-2">
                {review.images.map((img, index) => (
                  <div
                    key={index}
                    className="h-20 w-20 rounded-md overflow-hidden"
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Review image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <button className="flex items-center gap-1 hover:text-gray-900">
                <ThumbsUp className="h-4 w-4" />
                <span>Útil ({review.likes})</span>
              </button>
            </div>

            {review.id !== reviews.length && <Separator className="mt-4" />}
          </div>
        ))}
      </div>

      {/* More reviews button */}
    </div>
  );
}
