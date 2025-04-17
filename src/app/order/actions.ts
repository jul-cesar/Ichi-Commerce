"use server";

import { prisma } from "../../../db/instance";

// Create a new COD order

export async function createOrderWithoutLogin({
  items,
  direccionEnvio,
  nombre,
  apellidos,
  departamento,
  ciudad,
  nombreBarrio,
  telefonoContacto,
}: {
  items: { variacionId: string; cantidad: number }[];
  direccionEnvio: string;
  nombre: string;
  apellidos: string;
  departamento: string;
  ciudad: string;
  nombreBarrio: string;
  telefonoContacto: string;
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
        select: { producto: { select: { precio: true, precioDosificacion: true } } },
      });

      if (variacion?.producto?.precio) {
        if (item.cantidad === 2 && variacion.producto.precioDosificacion) {
          montoTotal += variacion.producto.precioDosificacion; // Use precioDosificacion for 2 items
        } else {
          montoTotal += item.cantidad * variacion.producto.precio; // Regular price for other quantities
        }
      }
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: undefined, // No user associated
        estado: "pendiente",
        direccionEnvio,
        nombre,
        apellidos,
        departamento,
        ciudad,
        nombreBarrio,
        telefonoContacto,
        montoTotal,
        items: {
          create: items.map((item) => ({
            variacionId: item.variacionId,
            cantidad: item.cantidad,
          })),
        },
      },
    });

    return { success: true, order };
  } catch (error: any) {
    console.error("Error creating order:", error);
    return { success: false, error: error.message };
  }
}

export async function createOrder({
  userId,
  items,
  direccionEnvio,
  nombreBarrio,
  apellidos,
  nombre,
  departamento,
  ciudad,
  telefonoContacto,
}: {
  userId: string;
  items: { variacionId: string; cantidad: number }[];
  direccionEnvio: string;
  nombreBarrio: string;
  telefonoContacto: string;
  apellidos: string;
  nombre: string;
  departamento: string;
  ciudad: string;
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
        select: { producto: { select: { precio: true, precioDosificacion: true } } },
      });

      if (variacion?.producto?.precio) {
        if (item.cantidad === 2 && variacion.producto.precioDosificacion) {
          montoTotal += variacion.producto.precioDosificacion; // Use precioDosificacion for 2 items
        } else {
          montoTotal += item.cantidad * variacion.producto.precio; // Regular price for other quantities
        }
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
        });
      }
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId,
        telefonoContacto: telefonoContacto,
        nombreBarrio: nombreBarrio,
        apellidos,
        nombre,
        departamento,
        ciudad,
        estado: "pendiente", // Initial state
        direccionEnvio,
        montoTotal,
        items: {
          create: orderItems,
        },
      },
    });

    return { success: true, order };
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
    console.error("Error fulfilling order:", error);
    return { success: false, error: error.message };
  }
}

export async function sendOrderToWhatsapp({
  nombre,
  fecha,
  items,
  telefono,
  direccion,
  total,
  barrio,
}: {
  nombre: string;
  fecha: string | Date;
  telefono:string
  items: { nombreProducto: string; cantidad: number; precio: number }[];
  direccion: string;
  barrio: string;
  total:number
}) {
  // Format the product details into a string
  const productosFormatted = items
    .map(
      (producto) =>
        `- ${producto.nombreProducto} (x${producto.cantidad}): $${producto.precio.toLocaleString(
          "es-CO"
        )}`
    )
    .join("\n");

  const payload = {
    messaging_product: "whatsapp",
    to: "573042680811", // Número del proveedor
    type: "template",
    template: {
      name: "neworder",
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nombre },
            {type: "text", text: telefono},
            { type: "text", text: fecha },
            { type: "text", text: productosFormatted },
            { type: "text", text: direccion },
            { type: "text", text: barrio },
            {type: "text", text: total.toLocaleString("es-CO")},
          ],
        },
      ],
    },
  };

  try {
    const response = await fetch(
      "https://graph.facebook.com/v19.0/589575280912545/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FB_TOKEN || ""}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Error al enviar WhatsApp:", data);
      throw new Error("Falló el envío");
    }

    return { success: true };
  } catch (error) {
    console.error("Error inesperado:", error);
    return { success: false };
  }
}
