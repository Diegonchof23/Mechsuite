// app/(main)/cambiar-password/ChangePasswordClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  nombreUsuario: string;
  esFirstLogin?: boolean;
}

export default function ChangePasswordClient({ nombreUsuario, esFirstLogin = false }: Props) {
  const router = useRouter();

  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordNuevaConfirm, setPasswordNuevaConfirm] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setExito(false);

    if (esFirstLogin) {
      // En primer login, no se requiere contraseña actual
      if (!passwordNueva || !passwordNuevaConfirm) {
        setError("Las contraseñas son obligatorias");
        return;
      }
    } else {
      // En cambio normal, se requiere contraseña actual
      if (!passwordActual || !passwordNueva || !passwordNuevaConfirm) {
        setError("Todos los campos son obligatorios");
        return;
      }
    }

    if (passwordNueva.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (passwordNueva !== passwordNuevaConfirm) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    setGuardando(true);

    try {
      const res = await fetch("/api/cambiar-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          passwordActual: esFirstLogin ? "" : passwordActual,
          passwordNueva,
          esFirstLogin,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Error al cambiar contraseña");
      }

      setExito(true);
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordNuevaConfirm("");

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message ?? "Error desconocido");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl p-8" style={{ background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(10px)' }}>
        <h1 className="text-2xl font-semibold mb-3 text-gray-900">Cambiar contraseña</h1>
        <p className="text-sm text-gray-700 mb-6">Usuario: {nombreUsuario}</p>

        {exito && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
            <p className="text-sm font-semibold">✓ Contraseña cambiad a exitosamente</p>
            <p className="text-xs text-gray-600 mt-1">Redirigiendo...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!esFirstLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Contraseña actual
              </label>
              <div className="relative">
                <input
                  type={showActual ? "text" : "password"}
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  className="w-full border rounded px-3 py-2 pr-12"
                  disabled={guardando}
                />
                <button
                  type="button"
                  onClick={() => setShowActual(!showActual)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showActual ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {esFirstLogin && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                Esta es tu primera sesión. Por favor, establece una nueva contraseña segura.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Contraseña nueva
            </label>
            <div className="relative">
              <input
                type={showNueva ? "text" : "password"}
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                className="w-full border rounded px-3 py-2 pr-12"
                disabled={guardando}
              />
              <button
                type="button"
                onClick={() => setShowNueva(!showNueva)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                {showNueva ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirmar contraseña nueva
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={passwordNuevaConfirm}
                onChange={(e) => setPasswordNuevaConfirm(e.target.value)}
                className="w-full border rounded px-3 py-2 pr-12"
                disabled={guardando}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                {showConfirm ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-800 rounded">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200"
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={guardando}
            >
              {guardando ? "Cambiando..." : "Cambiar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
