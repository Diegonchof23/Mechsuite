import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type Periodo = { start: Date; end: Date };

function periodoSegunModo(modo: 'trimestre' | 'semestre' | 'mes'): Periodo {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (modo === 'mes') {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    // mensual: siempre se usa el mes actual
    return { start, end };
  }

  const lastMonthOfQuarter = [3, 6, 9, 12];
  const lastMonthOfSemester = [6, 12];

  if (modo === 'trimestre') {
    const quarter = Math.ceil(month / 3); // 1-4
    const startCurrent = new Date(year, (quarter - 1) * 3, 1);
    const endCurrent = new Date(year, quarter * 3, 0, 23, 59, 59);
    const isLastMonth = lastMonthOfQuarter.includes(month);
    if (isLastMonth || quarter === 1) return { start: startCurrent, end: endCurrent };
    // usar trimestre anterior
    const startPrev = new Date(year, (quarter - 2) * 3, 1);
    const endPrev = new Date(year, (quarter - 1) * 3, 0, 23, 59, 59);
    return { start: startPrev, end: endPrev };
  }

  // semestre
  const semestre = month <= 6 ? 1 : 2;
  const startCurrent = semestre === 1 ? new Date(year, 0, 1) : new Date(year, 6, 1);
  const endCurrent = semestre === 1 ? new Date(year, 5, 30, 23, 59, 59) : new Date(year, 11, 31, 23, 59, 59);
  const isLastMonth = lastMonthOfSemester.includes(month);
  if (isLastMonth || semestre === 1) return { start: startCurrent, end: endCurrent };
  // semestre anterior
  const startPrev = new Date(year, 0, 1);
  const endPrev = new Date(year, 5, 30, 23, 59, 59);
  return { start: startPrev, end: endPrev };
}

// KPIs para la página de indicadores
export async function GET() {
  try {
    console.log('[GET /api/indicadores] iniciando...');
    const session = await getSession();
    console.log('[GET /api/indicadores] session:', session);
    
    if (!session?.id) {
      console.log('[GET /api/indicadores] sin sesión');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const roles = session?.roles ?? [];
    const esAdmin = roles.map((r: string) => r.toLowerCase()).includes('admin');
    console.log('[GET /api/indicadores] usuario:', session.id, 'roles:', roles, 'esAdmin:', esAdmin);

  // KPI1: Proporción de intervenciones registradas digitalmente
  // Definir constante de total intervenciones anuales (Tecmaq)
  const TOTAL_INTERV_ANUAL = 50; // Cambia este valor según corresponda
  const rangoKpi1 = periodoSegunModo('trimestre');
  const intervRegistradas = await prisma.ordenTrabajo.count({
    where: { fecha_creacion: { gte: rangoKpi1.start, lte: rangoKpi1.end } },
  });
  const kpi1 = (intervRegistradas / TOTAL_INTERV_ANUAL) * 100;

  // KPI2: % preventivos ejecutados en plazo
  // Buscar equipos con proxima_mantencion en el semestre
  const rangoKpi2 = periodoSegunModo('semestre');
  const equiposConMantencion = await prisma.equipo.findMany({
    where: {
      proxima_mantencion: { not: null, gte: rangoKpi2.start, lte: rangoKpi2.end }
    },
    include: {
      ordenes: {
        where: {
          tipo_ot: 'Preventiva',
          estado: 'Completada',
          fecha_cierre: { not: null }
        },
        orderBy: { fecha_cierre: 'desc' },
        take: 1 // Solo la última OT completada
      }
    }
  });
  
  const preventivosPlanificados = equiposConMantencion.length;
  const preventivosEnPlazo = equiposConMantencion.filter((equipo) => {
    if (!equipo.proxima_mantencion || equipo.ordenes.length === 0) return false;
    const ultimaOT = equipo.ordenes[0];
    if (!ultimaOT.fecha_cierre) return false;
    // Verificar si se completó antes o en la fecha programada
    return ultimaOT.fecha_cierre.getTime() <= equipo.proxima_mantencion.getTime();
  }).length;
  
  const kpi2 = preventivosPlanificados > 0 ? (preventivosEnPlazo / preventivosPlanificados) * 100 : 0;
  console.log('[KPI2] Planificados:', preventivosPlanificados, 'En plazo:', preventivosEnPlazo, 'Resultado:', kpi2);
  const vars2 = [
    { label: 'Preventivos planificados', value: preventivosPlanificados },
    { label: 'Preventivos en plazo', value: preventivosEnPlazo },
  ];

  // KPI3: % evaluaciones positivas
  const rangoKpi3 = periodoSegunModo('semestre');
  let totalEncuestas = 0;
  let positivas = 0;
  try {
    totalEncuestas = await (prisma as any).encuestaSatisfaccion.count({ where: { fecha_respuesta: { gte: rangoKpi3.start, lte: rangoKpi3.end } } });
    positivas = await (prisma as any).encuestaSatisfaccion.count({ where: { positiva: true, fecha_respuesta: { gte: rangoKpi3.start, lte: rangoKpi3.end } } });
    console.log('[GET /api/indicadores] KPI3 - totalEncuestas:', totalEncuestas, 'positivas:', positivas);
  } catch (err) {
    console.error('[GET /api/indicadores] KPI3 error:', err);
    throw err;
  }
  const kpi3 = totalEncuestas > 0 ? (positivas / totalEncuestas) * 100 : 0;
  const vars3 = [
    { label: 'Encuestas totales', value: totalEncuestas },
    { label: 'Encuestas positivas', value: positivas },
  ];

  // KPI4: Promedio días de resolución de OT cerradas
  const rangoKpi4 = periodoSegunModo('mes');
  console.log('[KPI4] Buscando OT entre:', rangoKpi4.start, 'y', rangoKpi4.end);
  const ordenesCerradas = await prisma.ordenTrabajo.findMany({ 
    where: { 
      estado: 'Completada', 
      fecha_cierre: { not: null, gte: rangoKpi4.start, lte: rangoKpi4.end } 
    }, 
    select: { id_ot: true, fecha_creacion: true, fecha_cierre: true } 
  });
  console.log('[KPI4] Ordenes cerradas encontradas:', ordenesCerradas.length);
  const tiempos = ordenesCerradas.map((ot: {id_ot: number, fecha_creacion: Date|null, fecha_cierre: Date|null}) => {
    if (!ot.fecha_creacion || !ot.fecha_cierre) {
      console.log('[KPI4] OT #', ot.id_ot, '- FECHA NULA, saltando');
      return 0;
    }
    const ms = ot.fecha_cierre.getTime() - ot.fecha_creacion.getTime();
    let dias = ms / (1000 * 60 * 60 * 24);
    
    // Si es menor a 1 día (mismo día), contar como 1 día mínimo
    if (dias > 0 && dias < 1) {
      console.log('[KPI4] OT #', ot.id_ot, '- Días calculados:', dias, '→ Ajustado a 1 día (mismo día de trabajo)');
      dias = 1;
    } else {
      console.log('[KPI4] OT #', ot.id_ot, '- Creación:', ot.fecha_creacion, 'Cierre:', ot.fecha_cierre, 'Días:', dias);
    }
    
    return dias;
  });
  
  // Filtrar valores 0 (fechas nulas)
  const tiemposValidos = tiempos.filter(t => t > 0);
  const promedioSinRedondear = tiemposValidos.length > 0 ? (tiemposValidos.reduce((a: number, b: number) => a + b, 0) / tiemposValidos.length) : 0;
  const kpi4 = Math.ceil(promedioSinRedondear); // Redondear hacia arriba al entero siguiente
  console.log('[KPI4] Tiempos válidos:', tiemposValidos.length, '- Suma total días:', tiemposValidos.reduce((a, b) => a + b, 0));
  console.log('[KPI4] Promedio sin redondear:', promedioSinRedondear, '- Resultado final redondeado:', kpi4);
  const vars4 = [
    { label: 'OT cerradas en periodo', value: ordenesCerradas.length },
  ];

  // KPI5: % equipos operativos respecto al total mantenido
  // Sin fecha de estado operacional, se usa el estado actual; periodo semestral aplica al corte actual
  const totalEquipos = await prisma.equipo.count();
  const operativos = await prisma.equipo.count({ where: { estado_operativo: true } });
  const kpi5 = totalEquipos > 0 ? (operativos / totalEquipos) * 100 : 0;
  const vars5 = [
    { label: 'Equipos totales', value: totalEquipos },
    { label: 'Equipos operativos', value: operativos },
  ];

    return NextResponse.json({
      kpi1,
      kpi2,
      kpi3,
      kpi4,
      kpi5,
      periodos: {
        kpi1: periodoSegunModo('trimestre'),
        kpi2: periodoSegunModo('semestre'),
        kpi3: periodoSegunModo('semestre'),
        kpi4: periodoSegunModo('mes'),
        kpi5: null,
      },
      detalles_vars: {
        kpi1: [
          { label: 'Intervenciones registradas', value: intervRegistradas },
          { label: 'Total intervenciones anuales', value: TOTAL_INTERV_ANUAL },
        ],
        kpi2: vars2,
        kpi3: vars3,
        kpi4: vars4,
        kpi5: vars5,
      },
      detalles: esAdmin
        ? {
            encuestas: await (prisma as any).encuestaSatisfaccion.findMany({
              select: {
                id_encuesta: true,
                fecha_respuesta: true,
                puntaje_total: true,
                positiva: true,
                comentario: true,
                usuario: { select: { nombre: true, apellido: true, email: true } },
              },
              orderBy: { fecha_respuesta: 'desc' },
            }),
          }
        : null,
    });
  } catch (err: any) {
    console.error('GET /api/indicadores error', err);
    return NextResponse.json({ error: 'Error interno en KPIs', detail: err?.message ?? String(err) }, { status: 500 });
  }
}
