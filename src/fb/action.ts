"use server";

// Tipos más específicos
interface CustomData {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
}

interface EventPayload {
  action_source: "website" | "app" | "other";
  event_name: string;
  event_time: number;
  
  user_data: {
    client_ip_address?: string;
    client_user_agent?: string;
  };
  custom_data?: CustomData;
}

// Función genérica para eviar duplicación de código
async function sendFacebookEventToPixel(
  pixelId: string,
  eventName: string,
  url: string,
  ip?: string,
  userAgent?: string,
  customData?: CustomData
) {
  const accessToken = process.env.FB_TOKEN;
  if (!accessToken) throw new Error("FB_ACCESS_TOKEN no está configurado");

  const eventPayload: EventPayload = {
    action_source: "website",
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
   
    user_data: {},
  };

  // Solo agregar user_data si los valores existen
  if (ip) eventPayload.user_data.client_ip_address = ip;
  if (userAgent) eventPayload.user_data.client_user_agent = userAgent;

  if (customData && Object.keys(customData).length > 0) {
    eventPayload.custom_data = customData;
  }

  const eventData = {
    data: [eventPayload],
    access_token: accessToken,
  };

  console.log(
    `Enviando evento ${eventName} al píxel ${pixelId}:`,
    JSON.stringify(eventData, null, 2)
  );

  try {
    const res = await fetch(
      `https://graph.facebook.com/v23.0/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      console.error(
        `Error response from Facebook API for pixel ${pixelId}:`,
        result
      );
      throw new Error(
        `HTTP error! status: ${res.status} - ${JSON.stringify(result)}`
      );
    }

    console.log(
      `Evento ${eventName} enviado exitosamente al píxel ${pixelId}:`,
      result
    );
    return result;
  } catch (error: any) {
    console.error(
      `Error al enviar evento ${eventName} al píxel ${pixelId}:`,
      error
    );
    throw new Error(`Error al enviar el evento: ${error.message}`);
  }
}

// Función específica para eventos de compra
// Función específica para eventos de compra
export async function sendPurchaseEvent(
  value: number,
  currency: string = "COP",
  ip?: string,
  userAgent?: string,
  productId?: string
) {
  // Determinar la URL basada en el producto
  let eventUrl = "https://www.chgroup.store";
  let targetPixel = "default";

  if (productId) {
    if (productId === "adc458fe-ac01-49be-b004-e646dd2177ec") {
      eventUrl =
        "https://www.chgroup.store/productos/adc458fe-ac01-49be-b004-e646dd2177ec";
      targetPixel = "adidas";
    } else if (productId === "aab267e9-da06-4c04-9405-866f7c06a3e9") {
      eventUrl =
        "https://www.chgroup.store/productos/aab267e9-da06-4c04-9405-866f7c06a3e9";
      targetPixel = "nike";
    }
  }

  const customData: CustomData = {
    value: value,
    currency: currency,
  };

  if (productId) {
    customData.content_ids = [productId];
    customData.content_type = "product";
    customData.num_items = 1;
  }

  try {
    let result;

    switch (targetPixel) {
      case "adidas":
        result = await sendFacebookEventToPixel(
          "1252332409762588",
          "Purchase",
          eventUrl,
          ip,
          userAgent,
          customData
        );
        break;
      case "nike":
        result = await sendFacebookEventToPixel(
          "1297697631699993",
          "Purchase",
          eventUrl,
          ip,
          userAgent,
          customData
        );
        break;
      default:
        const pixelId = "1004413738502227"
        if (!pixelId) throw new Error("PIXEL_ID no está configurado");
        result = await sendFacebookEventToPixel(
          pixelId,
          "Purchase",
          eventUrl,
          ip,
          userAgent,
          customData
        );
        break;
    }

    return {
      success: true,
      result,
      pixelUsed: targetPixel,
    };
  } catch (error: any) {
    console.error("Error enviando evento de compra:", error);
    return {
      success: false,
      error: error.message,
      pixelUsed: targetPixel,
    };
  }
}
// Función para enviar eventos de compra a todos los píxeles
export async function sendPurchaseEventToAll(
  value: number,
  currency: string = "COP",
  ip?: string,
  userAgent?: string,
  productIds?: string[]
) {
  const customData: CustomData = {
    value: value,
    currency: currency,
  };

  if (productIds && productIds.length > 0) {
    customData.content_ids = productIds;
    customData.content_type = "product";
    customData.num_items = productIds.length;
  }

  const pixelPromises = [
    {
      name: "Adidas",
      promise: sendFacebookEventToPixel(
        "1252332409762588",
        "Purchase",
        "https://www.chgroup.store/productos/adc458fe-ac01-49be-b004-e646dd2177ec",
        ip,
        userAgent,
        customData
      ),
    },
    {
      name: "Nike",
      promise: sendFacebookEventToPixel(
        "1004413738502227",
        "Purchase",
        "https://www.chgroup.store/productos/aab267e9-da06-4c04-9405-866f7c06a3e9",
        ip,
        userAgent,
        customData
      ),
    },
    {
      name: "Default",
      promise: (async () => {
        const pixelId = process.env.PIXEL_ID;
        if (!pixelId) throw new Error("PIXEL_ID no está configurado");
        return sendFacebookEventToPixel(
          pixelId,
          "Purchase",
          "https://www.chgroup.store",
          ip,
          userAgent,
          customData
        );
      })(),
    },
  ];

  const results = await Promise.allSettled(pixelPromises.map((p) => p.promise));

  // Log detallado de cada resultado
  results.forEach((result, index) => {
    const pixelName = pixelPromises[index].name;
    if (result.status === "rejected") {
      console.error(
        `❌ Error en píxel ${pixelName}:`,
        result.reason.message || result.reason
      );
    } else {
      console.log(`✅ Éxito en píxel ${pixelName}:`, result.value);
    }
  });

  // Contar éxitos y errores
  const successful = results.filter((result) => result.status === "fulfilled");
  const failed = results.filter((result) => result.status === "rejected");

  console.log(
    `📊 Resumen: ${successful.length} éxitos, ${failed.length} errores`
  );

  return {
    success: successful.length > 0,
    results,
    summary: {
      successful: successful.length,
      failed: failed.length,
      total: results.length,
    },
  };
}

// Funciones originales (mantener para compatibilidad)
export async function sendFacebookEventAdidas(
  eventName: string,
  url: string,
  ip?: string,
  userAgent?: string,
  customData?: CustomData
) {
  return sendFacebookEventToPixel(
    "1252332409762588",
    eventName,
    url,
    ip,
    userAgent,
    customData
  );
}

export async function sendFacebookEventNike(
  eventName: string,
  url: string,
  ip?: string,
  userAgent?: string,
  customData?: CustomData
) {
  return sendFacebookEventToPixel(
    "1004413738502227",
    eventName,
    url,
    ip,
    userAgent,
    customData
  );
}

export async function sendFacebookEvent(
  eventName: string,
  url: string,
  ip?: string,
  userAgent?: string,
  customData?: CustomData
) {
  const pixelId = process.env.PIXEL_ID;
  if (!pixelId) throw new Error("PIXEL_ID no está configurado");

  return sendFacebookEventToPixel(
    pixelId,
    eventName,
    url,
    ip,
    userAgent,
    customData
  );
}

export async function sendFacebookEventToAll(
  eventName: string,
  url: string,
  ip?: string,
  userAgent?: string,
  customData?: CustomData
) {
  const results = await Promise.allSettled([
    sendFacebookEventAdidas(eventName, url, ip, userAgent, customData),
    sendFacebookEventNike(eventName, url, ip, userAgent, customData),
    sendFacebookEvent(eventName, url, ip, userAgent, customData),
  ]);

  return results;
}
