import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true });

  // Borrar la cookie de sesión
  res.cookies.set("session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0, // expira inmediatamente
  });

  return res;
}
