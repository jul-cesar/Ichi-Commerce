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
  event_name: string;
  event_time: number;
  event_source_url: string;
  user_data: {
    client_ip_address?: string;
    client_user_agent?: string;
  };
  custom_data?: CustomData;
}

// Función genérica para evitar duplicación de código
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
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: url,
    user_data: {
      client_ip_address: ip,
      client_user_agent: userAgent,
    },
  };

  if (customData) {
    eventPayload.custom_data = customData;
  }

  const eventData = {
    data: [eventPayload],
    access_token: accessToken,
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v23.0/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.json();
    console.log(`Evento ${eventName} enviado al pixel ${pixelId}:`, result);
    
    return result;
  } catch (error: any) {
    console.error(`Error al enviar evento ${eventName} al pixel ${pixelId}:`, error);
    throw new Error(`Error al enviar el evento: ${error.message}`);
  }
}

export async function sendFacebookEventAdidas(
  eventName: string,
  url: string,
  ip?: string,
  userAgent?: string,
  customData?: CustomData
) {
  return sendFacebookEventToPixel("1252332409762588", eventName, url, ip, userAgent, customData);
}

export async function sendFacebookEventNike(
  eventName: string,
  url: string,
  ip?: string,
  userAgent?: string,
  customData?: CustomData
) {
  return sendFacebookEventToPixel("1004413738502227", eventName, url, ip, userAgent, customData);
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
  
  return sendFacebookEventToPixel(pixelId, eventName, url, ip, userAgent, customData);
}

// Función para enviar a todos los píxeles a la vez
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