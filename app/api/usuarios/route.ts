/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/usuarios/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generarPasswordAutomatico } from "@/lib/password";
import bcrypt from "bcryptjs";

// CREAR USUARIO
export async function POST(req: Request) {
  const session = await getSession();
  if (
    !session ||
    !session.roles.some(
      (r) => r === "Jefe" || r === "Admin" || r.toLowerCase() === "admin"
    )
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { nombre, apellido, email, telefono, rol, activo, password } = body;

  if (!nombre || !apellido || !email || !rol) {
    return NextResponse.json(
      { error: "Nombre, apellido, email y rol son obligatorios" },
      { status: 400 }
    );
  }

  try {
    const rolDb = await prisma.rol.findFirst({
      where: { nombre: String(rol) },
    });

    if (!rolDb) {
      return NextResponse.json(
        { error: `Rol no encontrado: ${rol}` },
        { status: 400 }
      );
    }

    // Generar contraseña automática si no viene
    const passwordToUse =
      password && password.trim().length > 0
        ? String(password)
        : generarPasswordAutomatico(String(nombre), String(apellido));

    const passwordHash = await bcrypt.hash(passwordToUse, 10);

    const user = await prisma.usuario.create({
      data: {
        nombre: String(nombre),
        apellido: String(apellido),
        email: String(email),
        telefono:
          telefono === null || telefono === undefined || telefono === ""
            ? null
            : String(telefono),
        password_hash: passwordHash,
        activo: typeof activo === "boolean" ? activo : true,
      },
    });

    await prisma.usuarioRol.create({
      data: {
        id_usuario: user.id_usuario,
        id_rol: rolDb.id_rol,
      },
    });

    const userFull = await prisma.usuario.findUnique({
      where: { id_usuario: user.id_usuario },
      include: {
        roles: { include: { rol: true } },
      },
    });

    return NextResponse.json({ ok: true, user: userFull });
  } catch (err) {
    console.error("Error al crear usuario", err);
    return NextResponse.json(
      { error: "Error al crear usuario en la BD" },
      { status: 500 }
    );
  }
}

// ACTUALIZAR USUARIO
export async function PATCH(req: Request) {
  const session = await getSession();
  if (
    !session ||
    !session.roles.some((r) => r === "Jefe" || r === "Admin")
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { id, email, telefono, activo, action } = body;

  const idNum = Number(id);
  if (!idNum || Number.isNaN(idNum)) {
    return NextResponse.json(
      { error: `ID inválido en el body: ${String(id)}` },
      { status: 400 }
    );
  }

  try {
    // Si action es reset-password
    if (action === "reset-password") {
      const user = await prisma.usuario.findUnique({
        where: { id_usuario: idNum },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      // Generar contraseña base = nombre + 12345
      const passwordBase = generarPasswordAutomatico(user.nombre, user.apellido);
      const passwordHash = await bcrypt.hash(passwordBase, 10);

      // Actualizar password_hash y primer_login = true
      const updatedUser = await prisma.usuario.update({
        where: { id_usuario: idNum },
        data: {
          password_hash: passwordHash,
          primer_login: true,
        },
      });

      return NextResponse.json({ ok: true, user: updatedUser });
    }

    // Actualización normal (email, telefono, activo)
    const data: any = {};

    if (email !== undefined) {
      data.email = email === null ? null : String(email);
    }
    if (telefono !== undefined) {
      data.telefono = telefono === null ? null : String(telefono);
    }
    if (activo !== undefined) {
      data.activo = Boolean(activo);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nada para actualizar" },
        { status: 400 }
      );
    }

    const user = await prisma.usuario.update({
      where: { id_usuario: idNum },
      data,
    });

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("Error al actualizar usuario", err);
    return NextResponse.json(
      { error: "Error al actualizar en la BD" },
      { status: 500 }
    );
  }
}

// ELIMINAR USUARIO
export async function DELETE(req: Request) {
  const session = await getSession();
  if (
    !session ||
    !session.roles.some((r) => r === "Jefe" || r === "Admin")
  ) {
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
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: idNum },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // No permitir borrar al usuario admin
    if (user.nombre === "Admin" && user.email === "admin@admin.cl") {
      return NextResponse.json(
        { error: "No se puede eliminar el usuario administrador inicial." },
        { status: 400 }
      );
    }

    // Eliminar encuestas del usuario
    await prisma.encuestaSatisfaccion.deleteMany({
      where: { id_usuario: idNum },
    });

    await prisma.usuarioRol.deleteMany({
      where: { id_usuario: idNum },
    });

    await prisma.usuario.delete({
      where: { id_usuario: idNum },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al eliminar usuario", err);
    return NextResponse.json(
      { error: "Error al eliminar usuario en la BD" },
      { status: 500 }
    );
  }
}
