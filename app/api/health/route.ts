import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const count = await prisma.cliente.count();
  return NextResponse.json({ ok: true, clientes: count });
}
