import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UsuariosClient from "./UsuariosClient";

export default async function UsuariosPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

const roles = session.roles;   
const esJefe = roles.includes("Jefe");
const esAdmin = roles.includes("Admin");


  // Solo jefe o admin pueden entrar
  if (!esJefe && !esAdmin) {
    redirect("/");
  }

  const usuarios = await prisma.usuario.findMany({
    where: {
      // 👇 NO traer el usuario admin "viejo"
      email: {
        not: "admin@admin.cl",
      },
      nombre: {
        not: "Admin",
      },
    },
    include: {
      roles: {
        include: { rol: true },
      },
    },
  });

  const usuariosDTO = usuarios.map((u) => ({
    id: u.id_usuario,
    nombre: u.nombre,
    apellido: u.apellido,
    email: u.email,
    telefono: u.telefono,
    activo: u.activo,
    roles: u.roles.map((ur) => ur.rol.nombre),
  }));

  return <UsuariosClient usuarios={usuariosDTO} esJefe={esJefe} esAdmin={esAdmin} />;
}
