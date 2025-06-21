"use server";

export async function sendFacebookEventNike(
  eventName: string,
  url: string,
  ip?: string,
  userAgent?: string,
  customData?: { value?: number; currency?: string }
) {
  const pixelId = "1004413738502227";

  const accessToken = process.env.FB_TOKEN;
  if (!accessToken) throw new Error("FB_ACCESS_TOKEN no está configurado");

  const eventPayload: any = {
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
  
    console.log("Evento enviado a Facebook:", eventName );

    return await res.json();
  } catch (error: any) {
    console.error("Error al enviar el evento a Facebook:", error);
    throw new Error(`Error al enviar el evento: ${error.message}`);
  }
}

export async function sendFacebookEvent(
  eventName: string,
  url: string,
  ip?: string,
  userAgent?: string,
  customData?: { value?: number; currency?: string }
) {
  const pixelId = process.env.PIXEL_ID;
  if (!pixelId) throw new Error("PIXEL_ID no está configurado");
  const accessToken = process.env.FB_TOKEN;
  if (!accessToken) throw new Error("FB_ACCESS_TOKEN no está configurado");

  const eventPayload: any = {
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

    console.log("Evento enviado a Facebook:", eventName);

    return await res.json();
  } catch (error: any) {
    console.error("Error al enviar el evento a Facebook:", error);
    throw new Error(`Error al enviar el evento: ${error.message}`);
  }
}
