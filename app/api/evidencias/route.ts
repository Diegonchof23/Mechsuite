import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// CREAR EVIDENCIA (Jefe y Técnico)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { idOt, tipo, urlArchivo, descripcion } = body;

  if (!idOt || !tipo || !urlArchivo) {
    return NextResponse.json(
      { error: "ID OT, tipo y URL del archivo son obligatorios" },
      { status: 400 }
    );
  }

  try {
    const orden = await prisma.ordenTrabajo.findUnique({
      where: { id_ot: Number(idOt) },
    });

    if (!orden) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    const evidencia = await prisma.evidenciaOT.create({
      data: {
        id_ot: Number(idOt),
        tipo: String(tipo),
        url_archivo: String(urlArchivo),
        descripcion: descripcion ? String(descripcion) : null,
        fecha_hora: new Date(),
      },
    });

    return NextResponse.json({ ok: true, evidencia });
  } catch (err) {
    console.error("Error al crear evidencia", err);
    return NextResponse.json(
      { error: "Error al crear evidencia en la BD" },
      { status: 500 }
    );
  }
}

// ELIMINAR EVIDENCIA (Jefe y Técnico si es suya)
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { id } = body;

  const idNum = Number(id);
  if (!idNum || Number.isNaN(idNum)) {
    return NextResponse.json(
      { error: `ID inválido en el body: ${String(id)}` },
      { status: 400 }
    );
  }

  try {
    const evidencia = await prisma.evidenciaOT.findUnique({
      where: { id_evidencia: idNum },
      include: {
        ot: true,
      },
    });

    if (!evidencia) {
      return NextResponse.json(
        { error: "Evidencia no encontrada" },
        { status: 404 }
      );
    }

    // Solo Jefe o Admin pueden eliminar evidencias (sin campo creator en la tabla)
    const esJefe = session.roles.includes("Jefe");
    const esAdmin = session.roles.includes("Admin");

    if (!esJefe && !esAdmin) {
      return NextResponse.json(
        { error: "No autorizado para eliminar esta evidencia" },
        { status: 403 }
      );
    }

    await prisma.evidenciaOT.delete({
      where: { id_evidencia: idNum },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al eliminar evidencia", err);
    return NextResponse.json(
      { error: "Error al eliminar evidencia en la BD" },
      { status: 500 }
    );
  }
}
