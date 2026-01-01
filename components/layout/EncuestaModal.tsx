"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export function EncuestaModal() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function check() {
      try {
        if (pathname.startsWith("/encuesta")) {
          setShow(false);
          setLoading(false);
          return;
        }
        // Si ya se cerró en esta sesión, no mostrar
        if (typeof window !== "undefined" && sessionStorage.getItem("encuesta_modal_cerrado") === "1") {
          setShow(false);
          setLoading(false);
          return;
        }

        const res = await fetch("/api/encuesta");
        const data = await res.json();
        // Solo mostrar si no ha respondido y es último mes del semestre, y no es admin
        const now = new Date();
        const mes = now.getMonth() + 1;
        const ultimoMes = mes === 6 || mes === 12;
        setShow(!data.respondida && ultimoMes && !data.esAdmin);
      } catch {
        setShow(false);
      } finally {
        setLoading(false);
      }
    }
    check();
  }, [pathname]);

  if (loading || !show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full pointer-events-auto border border-gray-200" style={{ background: 'rgba(255, 255, 255, 0.98)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
        <h2 className="text-xl font-bold mb-3 text-gray-900">Encuesta de Satisfacción</h2>
        <p className="mb-6 text-gray-700">Por favor, realiza la encuesta de satisfacción de MechSuite. ¡Tu opinión es importante!</p>
        <div className="flex gap-4 justify-end">
          <button onClick={() => { setShow(false); if (typeof window !== "undefined") sessionStorage.setItem("encuesta_modal_cerrado", "1"); }} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cerrar</button>
          <button onClick={() => { setShow(false); if (typeof window !== "undefined") sessionStorage.setItem("encuesta_modal_cerrado", "1"); router.push("/encuesta"); }}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Ir a encuesta</button>
        </div>
      </div>
    </div>
  );
}
