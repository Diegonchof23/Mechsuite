
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';



// GET: ¿El usuario ya respondió la encuesta este semestre?
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const userId = session.id;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  // Semestre: 1 = enero-junio, 2 = julio-diciembre
  const semestre = month <= 6 ? 1 : 2;
  const start = semestre === 1 ? new Date(year, 0, 1) : new Date(year, 6, 1);
  const end = semestre === 1 ? new Date(year, 5, 30, 23, 59, 59) : new Date(year, 11, 31, 23, 59, 59);
  const encuesta = await (prisma as any).encuestaSatisfaccion.findFirst({
    where: {
      id_usuario: userId,
      fecha_respuesta: {
        gte: start,
        lte: end,
      },
    },
  });
  const esAdmin = (session.roles || []).map((r) => r.toLowerCase()).includes('admin');
  return NextResponse.json({ respondida: !!encuesta, esAdmin });
}

// POST: Registrar encuesta
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const userId = session.id;
    console.log('[POST /api/encuesta] userId:', userId);
    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      console.error('[POST /api/encuesta] JSON parse error:', e);
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }
    const { respuestas, comentario } = body;
    console.log('[POST /api/encuesta] recibió respuestas:', respuestas, 'comentario:', comentario);
    if (!Array.isArray(respuestas) || respuestas.length !== 5) {
      console.error('[POST /api/encuesta] Respuestas inválidas:', respuestas);
      return NextResponse.json({ error: 'Deben ser 5 respuestas' }, { status: 400 });
    }
    const nums = respuestas.map((n: any) => {
      const parsed = typeof n === 'string' ? parseInt(n, 10) : Number(n);
      return isNaN(parsed) ? null : parsed;
    });
    if (nums.some((n) => n === null || n < 1 || n > 5)) {
      console.error('[POST /api/encuesta] Valores fuera de rango:', nums);
      return NextResponse.json({ error: 'Valores 1-5' }, { status: 400 });
    }
    console.log('[POST /api/encuesta] valores válidos:', nums);
    const puntaje_total = nums.reduce((a: number, b: number | null) => a + (b ?? 0), 0);
    const positiva = puntaje_total >= 20;
    const now = new Date();
    // Validar que no haya respondido ya este semestre
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const semestre = month <= 6 ? 1 : 2;
    const start = semestre === 1 ? new Date(year, 0, 1) : new Date(year, 6, 1);
    const end = semestre === 1 ? new Date(year, 5, 30, 23, 59, 59) : new Date(year, 11, 31, 23, 59, 59);
    const yaRespondio = await (prisma as any).encuestaSatisfaccion.findFirst({
      where: {
        id_usuario: userId,
        fecha_respuesta: {
          gte: start,
          lte: end,
        },
      },
    });
    if (yaRespondio) {
      return NextResponse.json({ error: 'Ya respondió este semestre' }, { status: 409 });
    }
    console.log('[POST /api/encuesta] creando encuesta para usuario:', userId);
    const encuesta = await (prisma as any).encuestaSatisfaccion.create({
      data: {
        id_usuario: userId,
        fecha_respuesta: now,
        puntaje_total,
        positiva,
        comentario: comentario && comentario.trim() ? comentario.trim() : null,
      },
    });
    console.log('[POST /api/encuesta] encuesta guardada:', encuesta.id_encuesta);
    
    return NextResponse.json({ ok: true, encuesta });
  } catch (err: any) {
    console.error('[POST /api/encuesta] Error:', err?.message || String(err));
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 });
  }
}

// GET /all: Listar encuestas (para KPIs)
export async function GET_ALL() {
  const encuestas = await (prisma as any).encuestaSatisfaccion.findMany();
  return NextResponse.json({ encuestas });
}
