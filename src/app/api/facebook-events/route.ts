import { sendFacebookEvent, sendFacebookEventNike } from "@/fb/action";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, url, ip, userAgent, value, currency } = body;

    if (url.includes("aab267e9-da06-4c04-9405-866f7c06a3e9")) {
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

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error enviando evento Facebook" },
      { status: 500 }
    );
  }
}
