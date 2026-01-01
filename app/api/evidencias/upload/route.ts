import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as unknown as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validaciones básicas
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (buffer.length > maxSize) {
      return NextResponse.json({ error: "Archivo demasiado grande (máx 10MB)" }, { status: 400 });
    }

    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".gif", ".docx", ".doc", ".xlsx"];
    const originalName = (file as any).name || `upload-${Date.now()}`;
    const ext = path.extname(originalName).toLowerCase();
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "evidencias");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeName = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9\.\-_]/g, "_")}`;
    const filePath = path.join(uploadDir, safeName);

    await fs.promises.writeFile(filePath, buffer);

    // Ruta pública accesible desde el navegador
    const publicPath = `/evidencias/${safeName}`;

    return NextResponse.json({ ok: true, path: publicPath });
  } catch (err) {
    console.error("Error upload evidencia:", err);
    return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 });
  }
}
