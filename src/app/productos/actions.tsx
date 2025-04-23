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
  secondAttributes = null, // Add secondAttributes for the second item
}: {
  productId: string;
  quantity: number;
  userId?: string; // Make userId optional for anonymous users
  attributes?: Record<string, string>;
  secondAttributes?: Record<string, string> | null;
}) {
  try {
    console.log(
      "Attributes:",
      attributes,
      "Second Attributes:",
      secondAttributes
    );
    const cookieStore = await cookies();
    let cartId = cookieStore.get("cartId")?.value;

    let cart = null;

    if (cartId) {
      // Check if the cartId corresponds to a valid cart by id or sessionId
      cart = await prisma.cart.findFirst({
        where: {
          OR: [
            { id: cartId }, // Logged-in user's cart
            { sessionId: cartId }, // Anonymous user's cart
          ],
        },
      });
    }

    if (!cart && userId) {
      // If no cart is found but the user is logged in, fetch the user's cart
      cart = await prisma.cart.findUnique({ where: { userId } });
    }

    if (!cart) {
      // Generate a new sessionId if the cart does not exist
      const newSessionId = crypto.randomUUID();
      cart = await prisma.cart.create({
        data: {
          userId: userId || null, // Associate with user if logged in
          sessionId: userId ? null : newSessionId, // Use sessionId for anonymous users
          createdAt: new Date(),
        },
      });

      // Save the new sessionId in the cookie
      if (!userId) {
        await cookieStore.set({
          name: "cartId",
          value: newSessionId,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: "/",
        });

        cartId = newSessionId;
      }
    } else if (userId && !cart.userId) {
      // If the user logs in and the cart is anonymous, associate it with the user
      cart = await prisma.cart.update({
        where: { id: cart.id },
        data: { userId },
      });
    }

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

    const findVariationId = (attrs: Record<string, string>) => {
      const matchingVariation = product.variaciones.find((variation) =>
        Object.entries(attrs).every(([attrName, attrValue]) =>
          variation.atributos.some(
            (attr) =>
              attr.valorAtributo.atributo.nombre === attrName &&
              attr.valorAtributo.valor === attrValue
          )
        )
      );

      return matchingVariation ? matchingVariation.id : null;
    };

    const variationId = findVariationId(attributes);
    if (!variationId) {
      throw new Error(
        "No se encontró una variación que coincida con los atributos proporcionados."
      );
    }

    let secondVariationId = null;
    if (secondAttributes) {
      secondVariationId = findVariationId(secondAttributes);
      if (!secondVariationId) {
        throw new Error(
          "No se encontró una variación que coincida con los atributos del segundo producto."
        );
      }
    }

    // Check if the first and second items are the same
    const isSameVariation = variationId === secondVariationId;

    // Check if the first item already exists in the cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variacionId: variationId,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.cantidad + (isSameVariation ? 2 : 1);

      if (newQuantity > 2) {
        return {
          success: false,
          error:
            "No puedes agregar más de 2 unidades de este producto al carrito.",
        };
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          cantidad: newQuantity,
          precioUnitario:
            newQuantity === 2
              ? product.precioDosificacion ?? product.precio
              : product.precio,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variacionId: variationId,
          cantidad: isSameVariation ? 2 : 1,
          precioUnitario:
            isSameVariation && quantity === 2
              ? product.precioDosificacion ?? product.precio
              : product.precio,
        },
      });
    }

    // If the second item is different, add it as a separate cart item
    if (!isSameVariation && secondVariationId) {
      const secondExistingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          variacionId: secondVariationId,
        },
      });

      if (secondExistingItem) {
        const newQuantity = secondExistingItem.cantidad + 1;

        if (newQuantity > 2) {
          return {
            success: false,
            error:
              "No puedes agregar más de 2 unidades de este producto al carrito.",
          };
        }

        await prisma.cartItem.update({
          where: { id: secondExistingItem.id },
          data: {
            cantidad: newQuantity,
            precioUnitario:
              newQuantity === 2
                ? product.precioDosificacion ?? product.precio
                : product.precio,
          },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            variacionId: secondVariationId,
            cantidad: 1,
            precioUnitario: product.precio,
          },
        });
      }
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

// Merge anonymous cart with user cart upon login
export async function mergeCartOnLogin(userId: string) {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get("cartId")?.value;

    if (!cartId) return { success: true }; // No anonymous cart to merge

    const anonymousCart = await prisma.cart.findUnique({
      where: { sessionId: cartId },
      include: { items: true },
    });

    if (!anonymousCart) return { success: true }; // No anonymous cart to merge

    let userCart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!userCart) {
      userCart = await prisma.cart.create({
        data: {
          userId,
          createdAt: new Date(),
        },
        include: { items: true },
      });
    }

    // Merge items from anonymous cart to user cart
    for (const item of anonymousCart.items) {
      const existingItem = userCart.items.find(
        (userItem) => userItem.variacionId === item.variacionId
      );

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { cantidad: existingItem.cantidad + item.cantidad },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            variacionId: item.variacionId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
          },
        });
      }
    }

    // Delete the anonymous cart
    await prisma.cart.delete({ where: { id: anonymousCart.id } });

    // Update the cookie to reflect the user's cart
    await cookieStore.set({
      name: "cartId",
      value: userCart.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error merging cart on login:", error);
    return { success: false, error: error.message || "Failed to merge cart" };
  }
}

// Get cart items for the current user
export async function getCartItems(userId?: string) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cartId")?.value;

    // Determine whether to fetch the cart by userId or sessionId
    const cart = userId
      ? await prisma.cart.findUnique({ where: { userId } }) // Logged-in user
      : sessionId
      ? await prisma.cart.findUnique({ where: { sessionId } }) // Anonymous user
      : null;

    if (!cart) {
      return []; // No cart found
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        variacion: {
          include: {
            producto: true, // Include producto
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

    // Filter out items where producto is null
    return cartItems.filter((item) => item.variacion.producto !== null);
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
