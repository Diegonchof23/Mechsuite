import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: Obtener notificaciones pendientes para el jefe y generar nuevas si es necesario
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const roles = session?.roles ?? [];
    const esJefe = roles.map((r: string) => r.toLowerCase()).includes('jefe');

    if (!esJefe) {
      return NextResponse.json({ notificaciones: [] });
    }

    // Generar notificaciones pendientes
    console.log('[GET /api/notificaciones] Generando notificaciones...');
    await generarNotificaciones();

    // Obtener todas las notificaciones con información del equipo y cliente
    console.log('[GET /api/notificaciones] Obteniendo notificaciones...');
    const notificaciones = await (prisma as any).notificacion.findMany({
      include: {
        equipo: {
          include: {
            cliente: true,
          },
        },
      },
      orderBy: {
        fecha_objetivo: 'asc',
      },
    });

    console.log('[GET /api/notificaciones] Notificaciones encontradas:', notificaciones.length);
    return NextResponse.json({ notificaciones });
  } catch (err: any) {
    console.error('[GET /api/notificaciones] error completo:', err);
    console.error('[GET /api/notificaciones] stack:', err?.stack);
    return NextResponse.json({ error: 'Error al obtener notificaciones', detail: err?.message }, { status: 500 });
  }
}

// PATCH: Marcar notificación como vista
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const roles = session?.roles ?? [];
    const esJefe = roles.map((r: string) => r.toLowerCase()).includes('jefe');

    if (!esJefe) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const idNotificacion = searchParams.get('id');
    const todas = searchParams.get('todas') === 'true';

    if (todas) {
      // Marcar todas como vistas
      await (prisma as any).notificacion.updateMany({
        data: { visto: true },
      });
    } else {
      if (!idNotificacion) {
        return NextResponse.json({ error: 'ID de notificación requerido' }, { status: 400 });
      }

      await (prisma as any).notificacion.update({
        where: { id_notificacion: parseInt(idNotificacion) },
        data: { visto: true },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[PATCH /api/notificaciones] error:', err);
    return NextResponse.json({ error: 'Error al marcar como vista' }, { status: 500 });
  }
}

// DELETE: Eliminar una notificación específica
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const roles = session?.roles ?? [];
    const esJefe = roles.map((r: string) => r.toLowerCase()).includes('jefe');

    if (!esJefe) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const idNotificacion = searchParams.get('id');

    if (!idNotificacion) {
      return NextResponse.json({ error: 'ID de notificación requerido' }, { status: 400 });
    }

    await (prisma as any).notificacion.delete({
      where: { id_notificacion: parseInt(idNotificacion) },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[DELETE /api/notificaciones] error:', err);
    return NextResponse.json({ error: 'Error al eliminar notificación' }, { status: 500 });
  }
}

// Función auxiliar para generar notificaciones
async function generarNotificaciones() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Obtener todos los equipos con fecha de próxima mantención
  const equipos = await prisma.equipo.findMany({
    where: {
      proxima_mantencion: {
        not: null,
        gte: hoy, // Solo equipos con mantención futura o hoy
      },
    },
    select: {
      id_equipo: true,
      proxima_mantencion: true,
    },
  });

  for (const equipo of equipos) {
    if (!equipo.proxima_mantencion) continue;

    const fechaMantencion = new Date(equipo.proxima_mantencion);
    fechaMantencion.setHours(0, 0, 0, 0);

    // Calcular días restantes
    const diffTime = fechaMantencion.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Generar notificación si faltan 30 días o menos (y es múltiplo de las alertas: 30, 14-29, 7-13, 0-6)
    let debeNotificar = false;
    
    if (diasRestantes <= 30 && diasRestantes > 14) {
      debeNotificar = true; // Rango 30-14 días
    } else if (diasRestantes <= 14 && diasRestantes > 7) {
      debeNotificar = true; // Rango 14-7 días
    } else if (diasRestantes <= 7 && diasRestantes >= 0) {
      debeNotificar = true; // Rango 7-0 días
    }

    if (debeNotificar) {
      // Verificar si ya existe una notificación para este equipo (sin importar la fecha exacta)
      // Esto evita crear múltiples notificaciones para la misma mantención
      const notificacionExistente = await (prisma as any).notificacion.findFirst({
        where: {
          id_equipo: equipo.id_equipo,
        },
      });

      // Solo crear si no existe ninguna notificación para este equipo
      if (!notificacionExistente) {
        console.log('[generarNotificaciones] Creando notificación para equipo:', equipo.id_equipo, 'dias restantes:', diasRestantes);
        await (prisma as any).notificacion.create({
          data: {
            id_equipo: equipo.id_equipo,
            fecha_objetivo: fechaMantencion,
          },
        });
      }
    }
  }
}
