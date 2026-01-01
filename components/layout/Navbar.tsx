import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isUltimoMesSemestre, yaRespondioEncuesta } from "@/lib/encuesta";
import { NotificacionesBell } from "./NotificacionesBell";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";


export async function Navbar() {
  const session = await getSession();
  const roles = session?.roles ?? [];
  const rolesLower = roles.map((r) => r.toLowerCase());
  const esJefe = rolesLower.includes("jefe");
  const esTecnico = rolesLower.includes("tecnico");
  const esAdmin = rolesLower.includes("admin");
  const fullName = session ? `${session.nombre} ${session.apellido}` : "Usuario";

  // Lógica para mostrar acceso a encuesta
  let mostrarEncuesta = false;
  if (session?.id && isUltimoMesSemestre() && !esAdmin) {
    mostrarEncuesta = !(await yaRespondioEncuesta(session.id));
  }

  return (
    <nav 
      className="w-full text-white flex items-center justify-between px-4 md:px-8 py-4" 
      style={{ 
        background: 'linear-gradient(135deg, #0024FF 0%, #0017b3 100%)',
        boxShadow: '0 2px 12px rgba(0, 36, 255, 0.3)'
      }}
    >

      {/* IZQUIERDA: Logo + Links visibles según rol */}
      <div className="flex items-center gap-8 text-sm font-medium">

        {/* Logo - Link a inicio */}
        <Link href="/" className="flex items-center transition-transform hover:scale-105">
          <img src="/mechsuite_logo.svg" alt="MechSuite" className="h-8 w-auto" />
        </Link>

        {/* Links - Solo visible en desktop */}
        <div className="hidden md:flex items-center gap-8">
          {/* Ambos roles: Técnico y Jefe (Admin también accede por diseño actual) */}
          <Link href="/equipos" className="transition-all hover:text-gray-200">Equipos</Link>
          <Link href="/ordenes" className="transition-all hover:text-gray-200">Órdenes de Trabajo</Link>

          {/* SOLO JEFE O ADMIN */}
          {(esJefe || esAdmin) && (
            <>
              <Link href="/clientes" className="transition-all hover:text-gray-200">Clientes</Link>
              <Link href="/usuarios" className="transition-all hover:text-gray-200">Usuarios</Link>
              <Link href="/indicadores" className="transition-all hover:text-gray-200">Indicadores</Link>
            </>
          )}
        </div>
      </div>

      {/* DERECHA: Menú móvil + Notificaciones + Usuario */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Menú hamburguesa - Solo visible en móvil */}
        <MobileMenu esJefe={esJefe} esAdmin={esAdmin} esTecnico={esTecnico} />

        {/* Campanita de notificaciones - solo para jefes */}
        {esJefe && <NotificacionesBell />}

        <UserMenu fullName={fullName} mostrarEncuesta={mostrarEncuesta} />
      </div>
    </nav>
  );
}
