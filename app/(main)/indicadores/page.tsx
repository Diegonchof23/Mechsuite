import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import IndicadoresClient from "./IndicadoresClient";

export default async function IndicadoresPage() {
  // Validar sesión y permisos (solo Jefe o Admin)
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const roles = session.roles.map((r) => r.toLowerCase());
  const esJefe = roles.includes("jefe");
  const esAdmin = roles.includes("admin");

  // Técnicos NO tienen acceso a indicadores
  if (!esJefe && !esAdmin) {
    redirect("/");
  }

  // Fetch datos de KPIs con las cookies de sesión
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  
  let data: any = null;
  
  try {
    const res = await fetch(`${baseUrl}/api/indicadores`, {
      cache: "no-store",
      headers: {
        Cookie: sessionCookie ? `session=${sessionCookie.value}` : "",
      },
    });
    
    if (res.ok) {
      data = await res.json();
    } else {
      console.error("Error al cargar KPIs:", res.status);
    }
  } catch (err) {
    console.error("Error al cargar KPIs:", err);
  }

  // Si no hay datos, mostrar error
  if (!data) {
    return (
      <div className="p-8">
        <p className="text-red-600">Error al cargar los indicadores. Intente nuevamente.</p>
      </div>
    );
  }

  // Renderizar el Client Component con los datos
  return <IndicadoresClient data={data} />;
}
