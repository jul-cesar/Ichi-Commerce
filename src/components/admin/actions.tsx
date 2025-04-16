"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "../../../db/instance";
import { ProductFormState } from "./multi-form/formContext";

export const getCategories = async () => {
  return await prisma.categoria.findMany({});
};

export const deleteCategorie = async (id: string) => {
  const del = await prisma.categoria.delete({
    where: {
      id,
    },
  });
  if (del) {
    return del;
  }
  return null;
};

export const editCategorie = async (
  id: string,
  data: Prisma.CategoriaGetPayload<{
    omit: {
      id: true;
      img: true;
    };
  }>
) => {
  const newCat = await prisma.categoria.update({
    where: {
      id,
    },
    data: {
      descripcion: data.descripcion,
      nombre: data.nombre,
    },
  });
  if (newCat) {
    return newCat;
  }
  return null;
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
      img: true;
    };
  }>
) => {
  const newCat = await prisma.categoria.create({
    data: {
      descripcion: categoria.descripcion,

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
      precioPromo: parseFloat(inputData.precioPromo),
      precioDosificacion: parseFloat(inputData.precioDosificacion),
      categoriaId: inputData.categoryId,
      imagenPrincipal: inputData.imagenPrincipal,
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
            every: {
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

export const actualizarVariacion = async (data: {
  productId: string;
  variationId: string;
  stock: number;
  attributes: {
    attributeId: string;
    valueId: string;
  }[];
}) => {
  try {
    const { variationId, stock, attributes, productId } = data;

    // Check for existing variations with the same attributes, excluding the current variation
    const variacionExistente = await prisma.variacionProducto.findFirst({
      where: {
        productoId: productId,
        id: { not: variationId }, // Exclude the current variation from the check
        atributos: {
          every: {
            opcionAtributoId: {
              in: attributes.map((atributo) => atributo.valueId),
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

    // 1. Update the stock of the variation
    await prisma.variacionProducto.update({
      where: { id: variationId },
      data: { stock },
    });

    // 2. Update the attributes of the variation
    // First, delete the existing attributes
    await prisma.variacionAtributo.deleteMany({
      where: { variacionProductoId: variationId },
    });

    // Then, create the new attributes
    await prisma.variacionAtributo.createMany({
      data: attributes.map((attribute) => ({
        variacionProductoId: variationId,
        opcionAtributoId: attribute.valueId,
      })),
    });

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar la variación:", error);
    return { success: false, error: "Error al actualizar la variación." };
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await prisma.producto.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    return false;
  }
};

export const deleteVariacion = async (id: string) => {
  try {
    await prisma.variacionProducto.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar la variación:", error);
    return { success: false, error: "No se pudo eliminar la variación." };
  }
};

export const addAttribute = async (data: {
  nombre: string;
  descripcion?: string;
}) => {
  try {
    const newAttribute = await prisma.atributoVariacion.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
      },
    });
    return { success: true, attribute: newAttribute };
  } catch (error) {
    console.error("Error al agregar el atributo:", error);
    return { success: false, error: "No se pudo agregar el atributo." };
  }
};

export const addAttributeValue = async (attributeId: string, value: string) => {
  try {
    const newValues = await prisma.opcionAtributo.create({
      data: {
        valor: value,
        atributoId: attributeId,
      },
    });
    return { success: true, values: newValues };
  } catch (error) {
    console.error("Error al agregar valores al atributo:", error);
    return { success: false, error: "No se pudieron agregar los valores." };
  }
};

export const deleteAttribute = async (attributeId: string) => {
  try {
    // Eliminar el atributo y sus opciones asociadas
    await prisma.atributoVariacion.delete({
      where: { id: attributeId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar el atributo:", error);
    return { success: false, error: "No se pudo eliminar el atributo." };
  }
};

export const editAttributeOption = async (
  optionId: string,
  newValue: string
) => {
  try {
    const updatedOption = await prisma.opcionAtributo.update({
      where: { id: optionId },
      data: { valor: newValue },
    });
    return { success: true, option: updatedOption };
  } catch (error) {
    console.error("Error al editar la opción del atributo:", error);
    return {
      success: false,
      error: "No se pudo editar la opción del atributo.",
    };
  }
};

export const editAttribute = async (
  attributeId: string,
  data: { nombre?: string; descripcion?: string }
) => {
  try {
    const updatedAttribute = await prisma.atributoVariacion.update({
      where: { id: attributeId },
      data: {
        nombre: data.nombre || undefined,
        descripcion: data.descripcion || undefined,
      },
    });
    return { success: true, attribute: updatedAttribute };
  } catch (error) {
    console.error("Error al editar el atributo:", error);
    return { success: false, error: "No se pudo editar el atributo." };
  }
};

export const deleteAttributeOption = async (optionId: string) => {
  try {
    await prisma.opcionAtributo.delete({
      where: { id: optionId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar la opción del atributo:", error);
    return {
      success: false,
      error: "No se pudo eliminar la opción del atributo.",
    };
  }
};
