import { prisma } from "@/lib/prisma";

// Devuelve true si estamos en el último mes del semestre (junio o diciembre)
export function isUltimoMesSemestre(date = new Date()) {
  const mes = date.getMonth() + 1;
  return mes === 6 || mes === 12;
}

// Devuelve true si el usuario ya respondió la encuesta este semestre
export async function yaRespondioEncuesta(id_usuario: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const semestre = month <= 6 ? 1 : 2;
  const start = semestre === 1 ? new Date(year, 0, 1) : new Date(year, 6, 1);
  const end = semestre === 1 ? new Date(year, 5, 30, 23, 59, 59) : new Date(year, 11, 31, 23, 59, 59);
  const encuesta = await (prisma as any).encuestaSatisfaccion.findFirst({
    where: {
      id_usuario,
      fecha_respuesta: {
        gte: start,
        lte: end,
      },
    },
  });
  return !!encuesta;
}
