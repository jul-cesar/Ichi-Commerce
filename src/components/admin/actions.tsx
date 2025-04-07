"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "../../../db/instance";

export const getCategories = async () => {
  return await prisma.categoria.findMany();
};

export const getAttributes = async () => {
  return await prisma.atributoVariacion.findMany({
    include: {
      OpcionAtributo: true,
    },
  });
};

export const crearCategoria = async (
  categoria: Prisma.CategoriaGetPayload<{
    omit: {
      id: true;
    };
  }>
) => {
  const newCat = await prisma.categoria.create({
    data: {
      descripcion: categoria.descripcion,
      img: categoria.img,
      nombre: categoria.nombre,
    },
  });

  if (!newCat) {
    return null;
  }
  return newCat;
};

export const crearAtributo = async (
  atributo: Prisma.AtributoVariacionGetPayload<{
    omit: {
      id: true;
    };
    include: {
      OpcionAtributo: {
        omit: {
          id: true;
          atributoId: true;
        };
      };
    };
  }>
) => {
  // Creamos el atributo junto con las opciones
  const newAtri = await prisma.atributoVariacion.create({
    data: {
      descripcion: atributo.descripcion,
      nombre: atributo.nombre,

      OpcionAtributo: {
        create: atributo.OpcionAtributo.map((opcion) => ({
          valor: opcion.valor, // Agregar valor para cada opción
        })),
      },
    },
  });

  if (!newAtri) {
    return null;
  }
  return newAtri;
};

export const guardarProducto = async (inputData: any) => {
  // Crear el Producto (si no está hecho aún)
  const producto = await prisma.producto.create({
    data: {
      nombre: inputData.name,
      precio: parseFloat(inputData.price), // Convertir precio a float

      categoriaId: inputData.category, // Relacionado con la categoría seleccionada
      imagenPrincipal: "", // Si hay imagen principal
    },
  });

  // Crear las Variaciones para el Producto
  const variaciones = await Promise.all(
    inputData.variations.map(async (variation: any) => {
      // Crear la variación
      const variacion = await prisma.variacionProducto.create({
        data: {
          productoId: producto.id, // Relacionamos la variación con el producto creado
          stock: variation.stock,
        },
      });

      await Promise.all(
        Object.keys(variation.attributes).map(async (attributeId) => {
          await prisma.variacionAtributo.create({
            data: {
              variacionId: variacion.id,
              nombre: variation.attributes[attributeId],
              valor: attributeId,
            },
          });
        })
      );

      return variacion;
    })
  );

  console.log(
    "Producto y variaciones creadas con éxito:",
    producto,
    variaciones
  );
};
