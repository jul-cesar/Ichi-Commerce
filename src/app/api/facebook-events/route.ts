
import { sendFacebookEvent } from '@/fb/action';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, url, ip, userAgent, value, currency } = body;

    const response = await sendFacebookEvent(
      eventName,
      url,
      ip,
      userAgent,
      { value, currency }
    );

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error enviando evento Facebook' },
      { status: 500 }
    );
  }
}
