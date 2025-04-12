"use server";

import { prisma } from "../../../db/instance";

// Create a new COD order
export async function createOrder({
  userId,
  items,
  direccionEnvio,
}: {
  userId: string;
  items: { variacionId: string; cantidad: number }[];
  direccionEnvio: string;
}) {
  try {
    // Validate stock availability
    for (const item of items) {
      const variacion = await prisma.variacionProducto.findUnique({
        where: { id: item.variacionId },
      });

      if (!variacion || variacion.stock < item.cantidad) {
        throw new Error(
          `Stock insuficiente para la variación con ID ${item.variacionId}`
        );
      }
    }

    // Reserve stock
    for (const item of items) {
      await prisma.variacionProducto.update({
        where: { id: item.variacionId },
        data: { stock: { decrement: item.cantidad } },
      });
    }

    // Calculate total amount
    let montoTotal = 0;
    for (const item of items) {
      const variacion = await prisma.variacionProducto.findUnique({
        where: { id: item.variacionId },
        select: { producto: { select: { precio: true } } },
      });

      if (variacion?.producto?.precio) {
        montoTotal += item.cantidad * variacion.producto.precio;
      }
    }

    // Create order items
    const orderItems = [];
    for (const item of items) {
      const variacion = await prisma.variacionProducto.findUnique({
        where: { id: item.variacionId },
        select: { producto: { select: { precio: true } } },
      });

      if (variacion?.producto?.precio) {
        orderItems.push({
          variacionId: item.variacionId,
          cantidad: item.cantidad,
          precioUnitario: variacion.producto.precio,
        });
      }
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId,
        estado: "pending", // Initial state
        direccionEnvio,
        montoTotal,
        items: {
          create: orderItems,
        },
      },
    });

    return { success: true, order };
  } catch (error:any) {
    console.error("Error creating order:", error);
    return { success: false, error: error.message };
  }
}

// Cancel an order
export async function cancelOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.estado !== "pending") {
      throw new Error("No se puede cancelar esta orden.");
    }

    // Release reserved stock
    for (const item of order.items) {
      await prisma.variacionProducto.update({
        where: { id: item.variacionId },
        data: { stock: { increment: item.cantidad } },
      });
    }

    // Update order state
    await prisma.order.update({
      where: { id: orderId },
      data: { estado: "canceled" },
    });

    return { success: true };
  } catch (error:any) {
    console.error("Error canceling order:", error);
    return { success: false, error: error.message };
  }
}

// Fulfill an order
export async function fulfillOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.estado !== "pending") {
      throw new Error("No se puede completar esta orden.");
    }

    // Update order state
    await prisma.order.update({
      where: { id: orderId },
      data: { estado: "fulfilled" },
    });

    return { success: true };
  } catch (error:any) {
    console.error("Error fulfilling order:", error);
    return { success: false, error: error.message };
  }
}
