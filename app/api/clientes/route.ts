/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/clientes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// CREAR CLIENTE
export async function POST(req: Request) {
  const session = await getSession();
  const puedeGestionarClientes =
    session &&
    (session.roles.includes("Jefe") || session.roles.includes("Admin"));

  if (!puedeGestionarClientes) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { razonSocial, rut, telefono, email, direccion } = body;

  if (!razonSocial || !rut || !direccion) {
    return NextResponse.json(
      { error: "Razón social, RUT y dirección son obligatorios" },
      { status: 400 }
    );
  }

  const rutVal = String(rut).toUpperCase();
  if (!/^\d{7,8}-[\dK]$/.test(rutVal)) {
    return NextResponse.json(
      { error: "RUT inválido. Formato válido: 12345678-5" },
      { status: 400 }
    );
  }

  try {
    const cliente = await prisma.cliente.create({
      data: {
        razon_social: String(razonSocial),
        rut: String(rut),
        telefono:
          telefono === null || telefono === undefined || telefono === ""
            ? null
            : String(telefono),
        email:
          email === null || email === undefined || email === ""
            ? null
            : String(email),
        direccion: String(direccion),
      },
    });

    return NextResponse.json({ ok: true, cliente });
  } catch (err: any) {
    console.error("Error al crear cliente", err);

    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un cliente con ese RUT." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear cliente en la BD" },
      { status: 500 }
    );
  }
}

// ACTUALIZAR CLIENTE
export async function PATCH(req: Request) {
  const session = await getSession();
  const puedeGestionarClientes =
    session &&
    (session.roles.includes("Jefe") || session.roles.includes("Admin"));

  if (!puedeGestionarClientes) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { id, razonSocial, rut, telefono, email, direccion } = body;

  const idNum = Number(id);
  if (!idNum || Number.isNaN(idNum)) {
    return NextResponse.json(
      { error: `ID inválido en el body: ${String(id)}` },
      { status: 400 }
    );
  }

  if (!razonSocial || !rut || !direccion) {
    return NextResponse.json(
      { error: "Razón social, RUT y dirección son obligatorios" },
      { status: 400 }
    );
  }

  const rutVal = String(rut).toUpperCase();
  if (!/^\d{7,8}-[\dK]$/.test(rutVal)) {
    return NextResponse.json(
      { error: "RUT inválido. Formato válido: 12345678-5" },
      { status: 400 }
    );
  }

  try {
    const cliente = await prisma.cliente.update({
      where: { id_cliente: idNum },
      data: {
        razon_social: String(razonSocial),
        rut: String(rut),
        telefono:
          telefono === null || telefono === undefined || telefono === ""
            ? null
            : String(telefono),
        email:
          email === null || email === undefined || email === ""
            ? null
            : String(email),
        direccion: String(direccion),
      },
    });

    return NextResponse.json({ ok: true, cliente });
  } catch (err: any) {
    console.error("Error al actualizar cliente", err);

    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un cliente con ese RUT." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar cliente en la BD" },
      { status: 500 }
    );
  }
}

// ELIMINAR CLIENTE
export async function DELETE(req: Request) {
  const session = await getSession();
  const puedeGestionarClientes =
    session &&
    (session.roles.includes("Jefe") || session.roles.includes("Admin"));

  if (!puedeGestionarClientes) {
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
    const equipos = await prisma.equipo.findMany({
      where: { id_cliente: idNum },
      select: { id_equipo: true },
    });

    if (equipos.length > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el cliente porque tiene equipos asociados.",
        },
        { status: 400 }
      );
    }

    await prisma.cliente.delete({
      where: { id_cliente: idNum },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al eliminar cliente", err);
    return NextResponse.json(
      { error: "Error al eliminar cliente en la BD" },
      { status: 500 }
    );
  }
}
