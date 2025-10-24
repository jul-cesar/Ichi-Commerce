import {
  sendFacebookEvent,
  sendFacebookEventAdidas,
  sendFacebookEventNike,
  sendFacebookEventSambas,
  sendFacebookEventYeezy
} from "@/fb/action";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, url, ip, userAgent, value, currency } = body;

    // Validación de datos requeridos
    if (!eventName || !url) {
      return NextResponse.json(
        { error: "eventName y url son requeridos" },
        { status: 400 }
      );
    }

    // Adidas
    if (url.includes("adc458fe-ac01-49be-b004-e646dd2177ec")) {
      console.log("Enviando evento a Facebook para Adidas");
      const response = await sendFacebookEventAdidas(
        eventName,
        url,
        ip,
        userAgent,
        { value, currency }
      );
      return NextResponse.json(response);
    }

    // Nike/Sandalias
    if (url.includes("aab267e9-da06-4c04-9405-866f7c06a3e9")) {
      console.log("Enviando evento a Facebook para Nike/Sandalias");
      const response = await sendFacebookEventNike(
        eventName,
        url,
        ip,
        userAgent,
        { value, currency }
      );
      return NextResponse.json(response);
    }

    if (url.includes("5980f8e1-86d3-4a43-b068-0c74ea7668b5")) {
      console.log("Enviando evento a Facebook para Sambas");
      const response = await sendFacebookEventSambas(
        eventName,
        url,
        ip,
        userAgent,
        { value, currency }
      );
      return NextResponse.json(response);
    }

    if (url.includes("4f8be720-cf6a-491b-ba98-282c32599cbb")) {
      console.log("Enviando evento a Facebook para Yeezy");
      const response = await sendFacebookEventYeezy(
        eventName,
        url,
        ip,
        userAgent,
        { value, currency }
      );
      return NextResponse.json(response);
    }

    // Píxel por defecto
    console.log("Enviando evento a Facebook para píxel por defecto");
    const response = await sendFacebookEvent(eventName, url, ip, userAgent, {
      value,
      currency,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error en API de Facebook Events:", error);
    return NextResponse.json(
      { error: error.message || "Error enviando evento Facebook" },
      { status: 500 }
    );
  }
}