import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HomePage() {
  const session = await getSession();
  const roles = session?.roles ?? [];
  const rolesLower = roles.map((r) => r.toLowerCase());
  const esJefe = rolesLower.includes("jefe");
  const esAdmin = rolesLower.includes("admin");
  const esTecnico = rolesLower.includes("tecnico");

  // Obtener estadísticas básicas
  const [totalClientes, totalEquipos, ordenesAbiertas, ordenesCerradas] = await Promise.all([
    (prisma as any).cliente.count(),
    (prisma as any).equipo.count(),
    (prisma as any).ordenTrabajo.count({
      where: { estado: { in: ["Pendiente", "En progreso"] } },
    }),
    (prisma as any).ordenTrabajo.count({
      where: { estado: "Completada" },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Bienvenida */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-3" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)' }}>
          Bienvenido a MechSuite
        </h1>
        <p className="text-xl text-gray-200" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          Gestiona tus operaciones y mantenciones de forma centralizada
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.96)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{totalClientes}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.96)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Equipos</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{totalEquipos}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.96)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">OT Abiertas</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{ordenesAbiertas}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.96)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">OT Cerradas</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{ordenesCerradas}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          Accesos Rápidos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(esJefe || esAdmin) && (
            <>
              <Link
                href="/equipos?crear=true"
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
                style={{ background: 'rgba(255, 255, 255, 0.96)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Añadir Equipo</span>
                </div>
              </Link>

              <Link
                href="/clientes?crear=true"
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
                style={{ background: 'rgba(255, 255, 255, 0.96)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Añadir Cliente</span>
                </div>
              </Link>

              <Link
                href="/usuarios?crear=true"
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
                style={{ background: 'rgba(255, 255, 255, 0.96)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Añadir Usuario</span>
                </div>
              </Link>

              <Link
                href="/ordenes?crear=true"
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
                style={{ background: 'rgba(255, 255, 255, 0.96)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Añadir OT</span>
                </div>
              </Link>
            </>
          )}

          {esTecnico && !esJefe && !esAdmin && (
            <>
              <Link
                href="/equipos"
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
                style={{ background: 'rgba(255, 255, 255, 0.96)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Ver Equipos</span>
                </div>
              </Link>

              <Link
                href="/ordenes"
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
                style={{ background: 'rgba(255, 255, 255, 0.96)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Ver Órdenes de Trabajo</span>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Panel Motivacional */}
      <div className="mb-8">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center" style={{ background: 'rgba(255, 255, 255, 0.96)' }}>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">Mantén tu taller bajo control</h3>
          <p className="text-gray-600 text-lg">
            MechSuite trabaja contigo para mejorar trazabilidad y eficiencia en cada proceso.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-300" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
        <p className="text-sm">© 2025 MechSuite — Plataforma de gestión para mantenimiento industrial.</p>
      </footer>
    </div>
  );
}
