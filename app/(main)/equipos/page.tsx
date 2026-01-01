import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EquiposClient from "./EquiposClient";

export default async function EquiposPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }


  const equipos = await prisma.equipo.findMany({
    include: {
      cliente: true,
      ordenes: {
        include: {
          creador: true,
          evidencias: true,
        },
      },
    },
    orderBy: { id_equipo: "asc" },
  });

  const clientes = await prisma.cliente.findMany({
    orderBy: { id_cliente: "asc" },
  });

  const equiposDTO = equipos.map((e) => ({
    id: e.id_equipo,
    idCliente: e.id_cliente,
    modelo: e.modelo,
    lineaProceso: e.linea_proceso,
    estadoOperativo: e.estado_operativo,
    fechaInstalacion: e.fecha_instalacion
      ? e.fecha_instalacion.toISOString().split("T")[0]
      : null,
    proximaMantencion: e.proxima_mantencion
      ? e.proxima_mantencion.toISOString().split("T")[0]
      : null,
    clienteNombre: e.cliente.razon_social,
    ordenesMantenimiento: e.ordenes.map((o) => ({
      id: o.id_ot,
      tipoOt: o.tipo_ot,
      estado: o.estado,
      descripcionSintoma: o.descripcion_sintoma,
      trabajoRealizado: o.trabajo_realizado,
      fechaCreacion: o.fecha_creacion.toISOString(),
      fechaCierre: o.fecha_cierre ? o.fecha_cierre.toISOString() : null,
      tecnicoNombre: o.creador
        ? `${o.creador.nombre} ${o.creador.apellido}`
        : null,
      evidencias: o.evidencias.map((ev) => ({
        id: ev.id_evidencia,
        tipo: ev.tipo,
        urlArchivo: ev.url_archivo,
        descripcion: ev.descripcion,
        fechaHora: ev.fecha_hora.toISOString(),
      })),
    })),
  }));

  const clientesDTO = clientes.map((c) => ({
    id: c.id_cliente,
    razonSocial: c.razon_social,
  }));

  const esJefe = session.roles.includes("Jefe");
  const esAdmin = session.roles.includes("Admin");

  return <EquiposClient equipos={equiposDTO} clientes={clientesDTO} esJefe={esJefe} esAdmin={esAdmin} />;
}
