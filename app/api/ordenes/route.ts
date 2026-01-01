import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// OBTENER ÓRDENES
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const idEquipoStr = searchParams.get("id_equipo");

  try {
    const where: any = {};
    
    if (idEquipoStr) {
      const idEquipo = Number(idEquipoStr);
      if (!isNaN(idEquipo)) {
        where.id_equipo = idEquipo;
      }
    }

    const ordenes = await prisma.ordenTrabajo.findMany({
      where,
      include: {
        equipo: {
          include: { cliente: true },
        },
        creador: true,
        evidencias: true,
      },
      orderBy: { id_ot: "desc" },
    });

    return NextResponse.json({ ok: true, ordenes });
  } catch (err) {
    console.error("Error al obtener órdenes", err);
    return NextResponse.json(
      { error: "Error al obtener órdenes" },
      { status: 500 }
    );
  }
}

// CREAR ORDEN (Jefe o Admin)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (!session.roles.includes("Jefe") && !session.roles.includes("Admin"))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const {
    idEquipo,
    tipoOt,
    prioridad,
    estado,
    descripcionSintoma,
    fechaProgramada,
  } = body;

  if (!idEquipo || !tipoOt || !prioridad || !estado) {
    return NextResponse.json(
      {
        error:
          "ID equipo, tipo OT, prioridad y estado son obligatorios",
      },
      { status: 400 }
    );
  }

  try {
    const equipo = await prisma.equipo.findUnique({
      where: { id_equipo: Number(idEquipo) },
    });

    if (!equipo) {
      return NextResponse.json(
        { error: "Equipo no encontrado" },
        { status: 404 }
      );
    }

    const orden = await prisma.ordenTrabajo.create({
      data: {
        id_equipo: Number(idEquipo),
        tipo_ot: String(tipoOt),
        prioridad: String(prioridad),
        estado: String(estado),
        fecha_creacion: new Date(),
        descripcion_sintoma: descripcionSintoma
          ? String(descripcionSintoma)
          : null,
        fecha_programada: fechaProgramada
          ? new Date(fechaProgramada)
          : null,
        id_creador: session.id,
      },
      include: {
        equipo: {
          include: { cliente: true },
        },
        creador: true,
        evidencias: true,
      },
    });

    return NextResponse.json({ ok: true, orden });
  } catch (err) {
    console.error("Error al crear orden", err);
    return NextResponse.json(
      { error: "Error al crear orden en la BD" },
      { status: 500 }
    );
  }
}

// ACTUALIZAR ORDEN (Jefe puede actualizar todo, Técnico solo descripción y estado)
export async function PATCH(req: Request) {
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

  const {
    id,
    tipoOt,
    prioridad,
    estado,
    descripcionSintoma,
    trabajoRealizado,
    repuestosUtilizados,
    fechaProgramada,
  } = body;

  const idNum = Number(id);
  if (!idNum || Number.isNaN(idNum)) {
    return NextResponse.json(
      { error: `ID inválido en el body: ${String(id)}` },
      { status: 400 }
    );
  }

  try {
    const ordenActual = await prisma.ordenTrabajo.findUnique({
      where: { id_ot: idNum },
    });

    if (!ordenActual) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // NO permitir editar órdenes completadas (con fecha_cierre)
    if (ordenActual.fecha_cierre) {
      return NextResponse.json(
        { error: "No se puede editar una orden completada" },
        { status: 400 }
      );
    }

    const data: any = {};
    const esJefe = session.roles.includes("Jefe");
    const esAdmin = session.roles.includes("Admin");

    if (esJefe || esAdmin) {
      // Jefe puede actualizar todo
      if (tipoOt !== undefined) data.tipo_ot = String(tipoOt);
      if (prioridad !== undefined) data.prioridad = String(prioridad);
      if (estado !== undefined) data.estado = String(estado);
      if (descripcionSintoma !== undefined) {
        data.descripcion_sintoma = descripcionSintoma
          ? String(descripcionSintoma)
          : null;
      }
      if (trabajoRealizado !== undefined) {
        data.trabajo_realizado = trabajoRealizado
          ? String(trabajoRealizado)
          : null;
      }
      if (repuestosUtilizados !== undefined) {
        data.repuestos_utilizados = repuestosUtilizados
          ? String(repuestosUtilizados)
          : null;
      }
      if (fechaProgramada !== undefined) {
        data.fecha_programada = fechaProgramada
          ? new Date(fechaProgramada)
          : null;
      }
    } else {
      // Técnico solo puede actualizar trabajo realizado y estado
      if (trabajoRealizado !== undefined) {
        data.trabajo_realizado = trabajoRealizado
          ? String(trabajoRealizado)
          : null;
      }
      if (estado !== undefined) {
        data.estado = String(estado);
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nada para actualizar" },
        { status: 400 }
      );
    }

    // Si se cambia el estado a "Completada", guardar fecha_cierre automáticamente
    if (data.estado === "Completada" && !ordenActual.fecha_cierre) {
      data.fecha_cierre = new Date();
    }

    const orden = await prisma.ordenTrabajo.update({
      where: { id_ot: idNum },
      data,
      include: {
        equipo: {
          include: { cliente: true },
        },
        creador: true,
        evidencias: true,
      },
    });

    return NextResponse.json({ ok: true, orden });
  } catch (err) {
    console.error("Error al actualizar orden", err);
    return NextResponse.json(
      { error: "Error al actualizar en la BD" },
      { status: 500 }
    );
  }
}

// ELIMINAR ORDEN (Jefe o Admin)
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || (!session.roles.includes("Jefe") && !session.roles.includes("Admin"))) {
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
    const orden = await prisma.ordenTrabajo.findUnique({
      where: { id_ot: idNum },
      include: { evidencias: true },
    });

    if (!orden) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar evidencias primero
    await prisma.evidenciaOT.deleteMany({
      where: { id_ot: idNum },
    });

    await prisma.ordenTrabajo.delete({
      where: { id_ot: idNum },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al eliminar orden", err);
    return NextResponse.json(
      { error: "Error al eliminar orden en la BD" },
      { status: 500 }
    );
  }
}
