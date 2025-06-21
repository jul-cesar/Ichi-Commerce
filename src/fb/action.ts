"use server"; // Indica que esto es un server action

export async function sendFacebookEvent(
  eventName: string,
  url: string,
  ip?: string,
  userAgent?: string,
  customData?: { value?: number; currency?: string }
) {
  const pixelId = '1004413738502227';
  const accessToken = process.env.FB_TOKEN;
  if (!accessToken) throw new Error('FB_ACCESS_TOKEN no está configurado');

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

  const res = await fetch(`https://graph.facebook.com/v17.0/${pixelId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Error Facebook API: ${JSON.stringify(error)}`);
  }

  return await res.json();
}
