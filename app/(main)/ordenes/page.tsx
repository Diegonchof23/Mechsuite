import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrdenesClient from "./OrdenesClient";

export default async function OrdenesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Ambos roles pueden ver órdenes
  const ordenes = await prisma.ordenTrabajo.findMany({
    include: {
      equipo: {
        include: { cliente: true },
      },
      creador: true,
      evidencias: true,
    },
    orderBy: { id_ot: "desc" },
  });

  const equipos = await prisma.equipo.findMany({
    include: { cliente: true },
    orderBy: { id_equipo: "asc" },
  });

  const tecnicos = await prisma.usuario.findMany({
    include: {
      roles: {
        include: { rol: true },
      },
    },
    where: {
      activo: true,
      roles: {
        some: {
          rol: {
            nombre: "Tecnico",
          },
        },
      },
    },
    orderBy: { nombre: "asc" },
  });

  const ordenesDTO = ordenes.map((o) => ({
    id: o.id_ot,
    idEquipo: o.id_equipo,
    equipoModelo: o.equipo.modelo,
    clienteNombre: o.equipo.cliente.razon_social,
    tipoOt: o.tipo_ot,
    prioridad: o.prioridad,
    estado: o.estado,
    descripcionSintoma: o.descripcion_sintoma,
    trabajoRealizado: o.trabajo_realizado,
    repuestosUtilizados: o.repuestos_utilizados,
    fechaCreacion: o.fecha_creacion.toISOString(),
    fechaProgramada: o.fecha_programada
      ? o.fecha_programada.toISOString()
      : null,
    fechaCierre: o.fecha_cierre ? o.fecha_cierre.toISOString() : null,
    idCreador: o.id_creador,
    creadorNombre: o.creador
      ? `${o.creador.nombre} ${o.creador.apellido}`
      : null,
    evidencias: o.evidencias.map((e) => ({
      id: e.id_evidencia,
      tipo: e.tipo,
      urlArchivo: e.url_archivo,
      descripcion: e.descripcion,
      fechaHora: e.fecha_hora.toISOString(),
    })),
  }));

  const equiposDTO = equipos.map((e) => ({
    id: e.id_equipo,
    modelo: e.modelo,
    clienteNombre: e.cliente.razon_social,
  }));

  const tecnicosDTO = tecnicos.map((t) => ({
    id: t.id_usuario,
    nombre: t.nombre,
    apellido: t.apellido,
  }));

  return (
    <OrdenesClient
      ordenes={ordenesDTO}
      equipos={equiposDTO}
      tecnicos={tecnicosDTO}
      usuarioId={session.id}
      esJefe={session.roles.includes("Jefe")}
      esAdmin={session.roles.includes("Admin")}
    />
  );
}
