import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "./lib/auth";


export async function middleware(req: NextRequest) {
  const token = await auth.api.getSession(req);
  const url = req.nextUrl;

  if (url.pathname.startsWith("/admin")) {
   
    if (!token || token.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // Apply middleware to /admin and all subpaths
};
