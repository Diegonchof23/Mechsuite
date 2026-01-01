"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  fullName: string;
  mostrarEncuesta: boolean;
};

export function UserMenu({ fullName, mostrarEncuesta }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer select-none transition-all hover:text-gray-200 font-medium"
      >
        <span>{fullName}</span>
        <span className="text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 bg-white text-gray-900 py-2 min-w-[180px]"
          style={{
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
            zIndex: 9999,
          }}
        >
          <Link
            href="/cambiar-password"
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Cambiar contraseña
          </Link>
          {mostrarEncuesta && (
            <Link
              href="/encuesta"
              className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-700 font-semibold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Responder encuesta
            </Link>
          )}
          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/logout", { method: "POST" });
                if (res.ok) {
                  router.push("/login");
                }
              } catch (err) {
                console.error("Error al cerrar sesión:", err);
              }
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
