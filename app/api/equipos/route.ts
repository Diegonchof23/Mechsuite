import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Helper para convertir fecha string YYYY-MM-DD a Date sin problemas de zona horaria
function parseFechaLocal(fechaStr: string): Date {
  // fechaStr viene como "YYYY-MM-DD"
  const [year, month, day] = fechaStr.split('-').map(Number);
  // Crear fecha a las 12:00 del mediodía para evitar problemas de zona horaria
  return new Date(year, month - 1, day, 12, 0, 0);
}

// OBTENER EQUIPOS (con filtros opcionales)
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const idClienteStr = searchParams.get("id_cliente");

  try {
    const where: any = {};
    
    if (idClienteStr) {
      const idCliente = Number(idClienteStr);
      if (!isNaN(idCliente)) {
        where.id_cliente = idCliente;
      }
    }

    const equipos = await prisma.equipo.findMany({
      where,
      include: {
        cliente: true,
      },
      orderBy: { id_equipo: "asc" },
    });

    // Formatear fechas para evitar problemas de zona horaria
    const equiposFormateados = equipos.map(eq => ({
      ...eq,
      fecha_instalacion: eq.fecha_instalacion 
        ? eq.fecha_instalacion.toISOString().split('T')[0] 
        : null,
      proxima_mantencion: eq.proxima_mantencion 
        ? eq.proxima_mantencion.toISOString().split('T')[0] 
        : null,
    }));

    return NextResponse.json({ ok: true, equipos: equiposFormateados });
  } catch (err) {
    console.error("Error al obtener equipos", err);
    return NextResponse.json(
      { error: "Error al obtener equipos" },
      { status: 500 }
    );
  }
}

// CREAR EQUIPO (Jefe o Admin)
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

  const { idCliente, modelo, lineaProceso, estadoOperativo, fechaInstalacion, proximaMantencion } = body;

  if (!idCliente || !modelo || !lineaProceso) {
    return NextResponse.json(
      { error: "ID cliente, modelo y línea de proceso son obligatorios" },
      { status: 400 }
    );
  }

  try {
    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id_cliente: Number(idCliente) },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    const equipo = await prisma.equipo.create({
      data: {
        id_cliente: Number(idCliente),
        modelo: String(modelo),
        linea_proceso: String(lineaProceso),
        estado_operativo: Boolean(estadoOperativo ?? true),
        fecha_instalacion: fechaInstalacion ? parseFechaLocal(fechaInstalacion) : null,
        proxima_mantencion: proximaMantencion ? parseFechaLocal(proximaMantencion) : null,
      },
      include: { cliente: true },
    });

    // Formatear fechas en la respuesta
    const equipoFormateado = {
      ...equipo,
      fecha_instalacion: equipo.fecha_instalacion 
        ? equipo.fecha_instalacion.toISOString().split('T')[0] 
        : null,
      proxima_mantencion: equipo.proxima_mantencion 
        ? equipo.proxima_mantencion.toISOString().split('T')[0] 
        : null,
    };

    return NextResponse.json({ ok: true, equipo: equipoFormateado });
  } catch (err) {
    console.error("Error al crear equipo", err);
    return NextResponse.json(
      { error: "Error al crear equipo en la BD" },
      { status: 500 }
    );
  }
}

// ACTUALIZAR EQUIPO (Jefe o Admin)
export async function PATCH(req: Request) {
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

  const { id, modelo, lineaProceso, estadoOperativo, fechaInstalacion, proximaMantencion } = body;

  const idNum = Number(id);
  if (!idNum || Number.isNaN(idNum)) {
    return NextResponse.json(
      { error: `ID inválido en el body: ${String(id)}` },
      { status: 400 }
    );
  }

  const data: any = {};

  if (modelo !== undefined) {
    data.modelo = String(modelo);
  }
  if (lineaProceso !== undefined) {
    data.linea_proceso = String(lineaProceso);
  }
  if (estadoOperativo !== undefined) {
    data.estado_operativo = Boolean(estadoOperativo);
  }
  if (fechaInstalacion !== undefined) {
    data.fecha_instalacion = fechaInstalacion ? parseFechaLocal(fechaInstalacion) : null;
  }
  if (proximaMantencion !== undefined) {
    data.proxima_mantencion = proximaMantencion ? parseFechaLocal(proximaMantencion) : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Nada para actualizar" },
      { status: 400 }
    );
  }

  try {
    const equipo = await prisma.equipo.update({
      where: { id_equipo: idNum },
      data,
      include: { cliente: true },
    });

    // Formatear fechas en la respuesta
    const equipoFormateado = {
      ...equipo,
      fecha_instalacion: equipo.fecha_instalacion 
        ? equipo.fecha_instalacion.toISOString().split('T')[0] 
        : null,
      proxima_mantencion: equipo.proxima_mantencion 
        ? equipo.proxima_mantencion.toISOString().split('T')[0] 
        : null,
    };

    return NextResponse.json({ ok: true, equipo: equipoFormateado });
  } catch (err) {
    console.error("Error al actualizar equipo", err);
    return NextResponse.json(
      { error: "Error al actualizar en la BD" },
      { status: 500 }
    );
  }
}

// ELIMINAR EQUIPO (Jefe o Admin)
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
    const equipo = await prisma.equipo.findUnique({
      where: { id_equipo: idNum },
      include: { 
        ordenes: true,
        notificaciones: true 
      },
    });

    if (!equipo) {
      return NextResponse.json(
        { error: "Equipo no encontrado" },
        { status: 404 }
      );
    }

    // Validar órdenes de trabajo
    if (equipo.ordenes.length > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar el equipo porque tiene ${equipo.ordenes.length} orden(es) de trabajo asociada(s). Elimina primero las órdenes.`,
        },
        { status: 400 }
      );
    }

    // Eliminar notificaciones asociadas antes de eliminar el equipo
    if (equipo.notificaciones.length > 0) {
      await prisma.notificacion.deleteMany({
        where: { id_equipo: idNum },
      });
    }

    // Eliminar el equipo
    await prisma.equipo.delete({
      where: { id_equipo: idNum },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al eliminar equipo", err);
    return NextResponse.json(
      { error: "Error al eliminar equipo en la BD" },
      { status: 500 }
    );
  }
}
