"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChangePasswordClient from "../../(main)/cambiar-password/ChangePasswordClient";

export default function PrimerLoginPage() {
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    const n = localStorage.getItem("primer_login_user");
    if (n) {
      setNombre(n);
      localStorage.removeItem("primer_login_user");
    }
  }, []);

  if (!nombre) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl p-8" style={{ background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(10px)' }}>
          <h2 className="text-xl font-semibold mb-3 text-gray-900">No se detectó usuario</h2>
          <p className="text-sm text-gray-700 mb-6">Parece que no se ha iniciado correctamente el flujo de primer ingreso.</p>
          <Link href="/login" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">Ir a iniciar sesión</Link>
        </div>
      </div>
    );
  }

  return <ChangePasswordClient nombreUsuario={nombre} esFirstLogin={true} />;
}
