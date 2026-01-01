import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // params viene como Promise<{ id: string }>
  const { id: idParam } = await params;

  let id: number | null = null;
  if (idParam) id = Number(idParam);

  // Fallback: parsear último segmento desde la URL (por si acaso)
  if (!id) {
    try {
      const u = request.nextUrl; // o new URL(request.url)
      const segments = u.pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1];
      id = Number(last);
    } catch {
      // ignore
    }
  }

  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  // URL a la que apuntará el QR
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const url = `${base}/equipos?openHistorial=${id}`;

  try {
    const buffer = await QRCode.toBuffer(url, { type: "png", width: 800 });
    return new Response(buffer, {
      headers: { "Content-Type": "image/png" },
    });
  } catch (err) {
    console.error("Error generando QR", err);
    return NextResponse.json({ error: "Error generando QR" }, { status: 500 });
  }
}
