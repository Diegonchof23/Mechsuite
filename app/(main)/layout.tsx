// app/(main)/layout.tsx
import { Navbar } from "@/components/layout/Navbar";
import { EncuestaModal } from "@/components/layout/EncuestaModal";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Si no hay sesión, mandamos al login
  if (!session) {
    // Intentar leer pathname del header inyectado por middleware
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/";
    const searchParams = headersList.get("x-search-params") || "";

    // Si la ruta es /equipos/[id] o similar (QR), guardar como intended_url
    const fullPath = pathname + (searchParams ? `?${searchParams}` : "");

    // Redirigir a login con parámetro from
    redirect(`/login?from=${encodeURIComponent(fullPath)}`);
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.65) 100%), url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Navbar />
      {/* Modal de encuesta solo si corresponde */}
      <EncuestaModal />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
