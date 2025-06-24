import { sendFacebookEvent, sendFacebookEventNike } from "@/fb/action";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, url, ip, userAgent, value, currency } = body;

    if (url.includes("aab267e9-da06-4c04-9405-866f7c06a3e9")) {
      console.log("Enviando evento a Facebook para Sandalias");
      const response = await sendFacebookEventNike(
        eventName,
        url,
        ip,
        userAgent,
        { value, currency }
      );

      return NextResponse.json(response);
    }

    const response = await sendFacebookEvent(eventName, url, ip, userAgent, {
      value,
      currency,
    });
    console.log("Enviando evento a Facebook para Nike");

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error enviando evento Facebook" },
      { status: 500 }
    );
  }
}
