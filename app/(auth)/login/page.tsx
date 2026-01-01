"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al iniciar sesión");
      return;
    }

    // Obtener URL intended (si viene del QR)
    const intendedUrl = localStorage.getItem("intended_url");
    localStorage.removeItem("intended_url");

    // Si es primer login, guardamos usuario temporalmente y redirigimos
    if (data.primer_login) {
      try {
        const nombreUsuario = email.split("@")[0];
        localStorage.setItem("primer_login_user", nombreUsuario);
      } catch (e) {
        // ignore
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
      window.location.href = "/cambiar-password-primer-login";
    } else {
      // Login normal: esperar un momento y redirigir
      await new Promise((resolve) => setTimeout(resolve, 150));
      // Si hay URL intended (ej: del QR), redirigir allá; si no, al home
      const redirectUrl = intendedUrl || "/";
      window.location.href = redirectUrl;
    }
  }

  // Guardar URL intended si viene del QR (al parámetro ?from=...)
  useEffect(() => {
    const fromParam = searchParams?.get("from");
    if (fromParam) {
      try {
        localStorage.setItem("intended_url", fromParam);
      } catch (e) {
        // ignore
      }
    }
  }, [searchParams]);

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-96" style={{ background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(10px)' }}>
      <h1 className="text-2xl font-semibold mb-6 text-center text-gray-900">Iniciar sesión</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            className="border rounded-lg p-3 pr-12 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
          >
            {showPassword ? (
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

        {error && (
          <p className="text-red-600 text-sm text-center font-medium">{error}</p>
        )}

        <button
          type="submit"
          className="text-white rounded-lg p-3 font-medium transition-all hover:shadow-lg"
          style={{ 
            background: 'linear-gradient(135deg, #0024ff 0%, #0017b3 100%)',
            boxShadow: '0 4px 12px rgba(0, 36, 255, 0.3)'
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96" style={{ background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(10px)' }}>
        <div className="text-center">Cargando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
