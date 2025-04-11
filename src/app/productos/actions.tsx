"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "../../../db/instance";

// Add item to cart
export async function addToCart({
  productId,
  quantity,
  userId,
  attributes = {},
}: {
  productId: string;
  quantity: number;
  userId: string;
  attributes?: Record<string, string>;
}) {
  try {
    const cookieStore = await cookies();
    let cartId = cookieStore.get("cartId")?.value;

    // Verifica si el usuario existe en la base de datos
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      throw new Error("El usuario no existe en la base de datos.");
    }

    // Check if cart exists, otherwise create a new one
    let cart = cartId
      ? await prisma.cart.findUnique({ where: { id: cartId } })
      : null;

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: userId,
          createdAt: new Date(),
        },
      });

      // Save the new cart ID in cookie
      await cookieStore.set({
        name: "cartId",
        value: cart.id,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 días
        path: "/",
      });

      cartId = cart.id;
    }

    // Find the specific variation based on attributes
    let variationId: string | null = null;

    const product = await prisma.producto.findUnique({
      where: { id: productId },
      include: {
        variaciones: {
          include: {
            atributos: {
              include: {
                valorAtributo: {
                  include: {
                    atributo: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new Error("El producto no existe en la base de datos.");
    }

    if (product.variaciones.length === 0) {
      throw new Error("El producto no tiene variaciones disponibles.");
    }

    if (Object.keys(attributes).length > 0) {
      const matchingVariation = product.variaciones.find((variation) =>
        Object.entries(attributes).every(([attrName, attrValue]) =>
          variation.atributos.some(
            (attr) =>
              attr.valorAtributo.atributo.nombre === attrName &&
              attr.valorAtributo.valor === attrValue
          )
        )
      );

      if (matchingVariation) {
        variationId = matchingVariation.id;
      } else {
        console.error(
          "No se encontró una variación que coincida con los atributos:",
          attributes
        );
        throw new Error(
          "No se encontró una variación de producto válida.",
          attributes
        );
      }
    } else {
      console.error(
        "No se proporcionaron atributos para buscar una variación."
      );
      throw new Error("No se encontró una variación de producto válida.");
    }

    // Validar que variationId sea válido
    const variationExists = await prisma.variacionProducto.findUnique({
      where: { id: variationId },
    });
    if (!variationExists) {
      throw new Error(
        "La variación de producto no existe en la base de datos."
      );
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cartId!,
        variacionId: variationId,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { cantidad: existingItem.cantidad + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cartId!,
          variacionId: variationId,
          cantidad: quantity,
          precioUnitario: 100, // Reemplaza con el precio real de la variación
        },
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    return {
      success: false,
      error: error.message || "Failed to add item to cart",
    };
  }
}

// Get cart items for the current user
export async function getCartItems() {
  try {
    const cookieStore = await cookies();
    let cartId = cookieStore.get("cartId")?.value;

    let cart = cartId
      ? await prisma.cart.findUnique({ where: { id: cartId } })
      : null;

    if (!cart) {
      return [];
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cartId },
      include: {
        variacion: {
          include: {
            producto: true,
            atributos: {
              include: {
                valorAtributo: {
                  include: {
                    atributo: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return cartItems;
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return [];
  }
}

// Remove item from cart
export async function removeFromCart(itemId: string) {
  try {
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return { success: false, error: "Failed to remove item from cart" };
  }
}

// Update item quantity
export async function updateCartItemQuantity(itemId: string, quantity: number) {
  try {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { cantidad: quantity },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return { success: false, error: "Failed to update item quantity" };
  }
}
