"use client";

import AtributesSelect from "@/components/AtributesSelect";
import { Prisma } from "@prisma/client";
import { useState } from "react";
import { ClientProductActions } from "./productActions";

type ProductClientProps = {
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

export default function ProductClient({ product }: ProductClientProps) {
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
        product={product}
        selectedAttributes={selectedAttributes}
      />
    </div>
  );
}
