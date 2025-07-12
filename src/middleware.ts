import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";



export async function middleware(req: NextRequest) {
    const apiSessionUrl = `${req.nextUrl.origin}/api/session`;
   const res = await fetch(apiSessionUrl, {
    headers: { cookie: req.headers.get("cookie") || "" },
  });
    const session = await res.json(); 
  const url = req.nextUrl;



  if (url.pathname.startsWith("/admin")) {
   
    if (!session || session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
