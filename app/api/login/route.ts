// app/api/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Faltan credenciales" },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await prisma.usuario.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 400 }
      );
    }

    if (!user.activo) {
      return NextResponse.json(
        { error: "Su cuenta está desactivada. Contactese con el gerente." },
        { status: 403 }
      );
    }

    // ⚠️ Comparación SIN hash (solo para desarrollo, como acordamos)
    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 400 }
      );
    }

    // Sacamos nombres de roles: ["Jefe"] o ["Tecnico"]
    const roles = user.roles.map((ur) => ur.rol.nombre);

    const sessionData = {
      id: user.id_usuario,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      roles,
      primer_login: (user as any).primer_login,
    };

    const res = NextResponse.json({ ok: true, primer_login: (user as any).primer_login });

    // Cookie de sesión sencilla
    res.cookies.set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error interno en el login" },
      { status: 500 }
    );
  }
}
