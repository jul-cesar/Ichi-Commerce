"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "../../../db/instance";
import { ProductFormState } from "./multi-form/formContext";

export const getCategories = async () => {
  return await prisma.categoria.findMany({});
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

export const guardarProducto = async (inputData: ProductFormState) => {
  // Crear el Producto
  const producto = await prisma.producto.create({
    data: {
      nombre: inputData.nombre,
      descripcion: inputData.descripcion,
      precio: parseFloat(inputData.precio),
      categoriaId: inputData.categoryId,
      imagenPrincipal: "",
    },
  });

  // Crear las Variaciones para el Producto
  const variaciones = await Promise.all(
    inputData.variations.map(async (variation) => {
      // Crear la variación
      const variacionCreada = await prisma.variacionProducto.create({
        data: {
          productoId: producto.id,
          stock: variation.stock,
        },
      });

      // Insertar los atributos de la variación
      await Promise.all(
        Object.keys(variation.attributes).map(async (attributeId) => {
          const opcionAtributoId = variation.attributes[attributeId];

          if (opcionAtributoId) {
            // Verificar si la opcionAtributoId existe.
            const opcionAtributo = await prisma.opcionAtributo.findUnique({
              where: {
                id: opcionAtributoId,
              },
            });

            if (opcionAtributo) {
              await prisma.variacionAtributo.create({
                data: {
                  variacionProductoId: variacionCreada.id,

                  opcionAtributoId: opcionAtributoId,
                },
              });
            } else {
              console.error(
                `OpcionAtributo con ID ${opcionAtributoId} no encontrada.`
              );
            }
          }
        })
      );

      return variacionCreada;
    })
  );

  return producto;
};

export const editarProducto = async (
  productId: string,
  productData: Prisma.ProductoGetPayload<{
    omit: {
      id: true;
      createdAt: true;
      updatedAt: true;
      imagenPrincipal: true;
    };
  }>
) => {
  await prisma.producto.update({
    where: { id: productId },
    data: productData,
  });
};

export const createVariation = async (data: {
  productoId: string;
  atributos: {
    attributeId: string;
    valueId: string;
  }[];
  stock: number;
}) => {
  try {
    const variacionExistente = await prisma.variacionProducto.findFirst({
      where: {
        AND: {
          productoId: data.productoId,
          atributos: {
            some: {
              opcionAtributoId: {
                in: data.atributos.map((atributo) => atributo.valueId),
              },
            },
          },
        },
      },
    });

    if (variacionExistente) {
      return {
        success: false,
        error: "Ya existe una variación con estos atributos.",
      };
    }

    const nuevaVariacion = await prisma.variacionProducto.create({
      data: {
        productoId: data.productoId,
        stock: data.stock,
      },
    });

    await prisma.variacionAtributo.createMany({
      data: data.atributos.map((atributo) => ({
        variacionProductoId: nuevaVariacion.id,
        opcionAtributoId: atributo.valueId,
      })),
    });

    return {
      success: true,
      variacionId: nuevaVariacion.id,
    };
  } catch (error) {
    console.error("Error al crear la variación:", error);
    return {
      success: false,
      error: "Hubo un problema al crear la variación.",
    };
  }
};
