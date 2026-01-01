// app/api/cambiar-password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

// CAMBIAR CONTRASEÑA (usuario loggeado)
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

  const { passwordActual, passwordNueva, esFirstLogin } = body;

  if (!passwordNueva) {
    return NextResponse.json(
      { error: "Contraseña nueva es obligatoria" },
      { status: 400 }
    );
  }

  if (passwordNueva.length < 8) {
    return NextResponse.json(
      { error: "La nueva contraseña debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: session.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Si NO es primer login, verificar contraseña actual
    if (!esFirstLogin) {
      if (!passwordActual) {
        return NextResponse.json(
          { error: "Contraseña actual es obligatoria" },
          { status: 400 }
        );
      }

      const passwordOk = await bcrypt.compare(passwordActual, user.password_hash);
      if (!passwordOk) {
        return NextResponse.json(
          { error: "La contraseña actual es incorrecta" },
          { status: 401 }
        );
      }
    }

    // Hash nueva contraseña
    const newHash = await bcrypt.hash(passwordNueva, 10);

    // Actualizar password y primer_login si corresponde
    await prisma.usuario.update({
      where: { id_usuario: session.id },
      data: {
        password_hash: newHash,
        ...(esFirstLogin && { primer_login: false }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al cambiar contraseña", err);
    return NextResponse.json(
      { error: "Error al cambiar contraseña" },
      { status: 500 }
    );
  }
}
