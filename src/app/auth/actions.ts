"use server";

import { cookies } from "next/headers";

export async function clearCartCookie() {
  const cookieStore =await cookies();
  await cookieStore.set({
    name: "cartId",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0, // Expire immediately
    path: "/",
  });
}
