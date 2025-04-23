"use client";

import AtributesSelect from "@/components/AtributesSelect";
import { Prisma } from "@prisma/client";
import { useState } from "react";
import { ClientProductActions } from "./productActions";

type ProductClientProps = {
  promoPercentage?: number;
  product: Prisma.ProductoGetPayload<{
    include: {
      categoria: true;
      variaciones: {
        include: {
          atributos: {
            include: {
              valorAtributo: {
                include: {
                  atributo: true;
                };
              };
            };
          };
        };
      };
    };
  }>;
};

export default function ProductClient({ product, promoPercentage }: ProductClientProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<{
    [key: string]: string;
  }>({});

  return (
    <div className="flex flex-col gap-4">
      <AtributesSelect
        product={product}
        onSelectionChange={setSelectedAttributes}
      />
      <ClientProductActions
      promoPorcent={promoPercentage}
        product={product}
        selectedAttributes={selectedAttributes}
      />
    </div>
  );
}
