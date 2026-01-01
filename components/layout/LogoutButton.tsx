"use client";

import { useState } from "react";

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingOut(true);

    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        // Esperar un poco y redirigir al login
        await new Promise((resolve) => setTimeout(resolve, 100));
        window.location.href = "/login";
      } else {
        console.error("Error en logout:", res.status);
        setIsLoggingOut(false);
      }
    } catch (err) {
      console.error("Error durante logout:", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <form onSubmit={handleLogout}>
      <button
        type="submit"
        disabled={isLoggingOut}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
      >
        {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
      </button>
    </form>
  );
}
